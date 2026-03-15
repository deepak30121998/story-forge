import { generateChapter } from "../services/gemini.js";
import { uploadImage } from "../services/storage.js";
import { generateNarration } from "../services/tts.js";
import * as db from "../services/firestore.js";
import { config } from "../config.js";

export function setupWebSocket(wss) {
  wss.on("connection", (ws) => {
    console.log("WebSocket client connected");
    let isProcessing = false;

    ws.on("message", async (raw) => {
      let msg;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        sendJSON(ws, { type: "error", message: "Invalid JSON" });
        return;
      }

      if (!msg || typeof msg.type !== "string") {
        sendJSON(ws, { type: "error", message: "Missing message type" });
        return;
      }

      if (isProcessing) {
        sendJSON(ws, { type: "error", message: "Already processing a request, please wait" });
        return;
      }

      try {
        isProcessing = true;
        await handleMessage(ws, msg);
      } catch (err) {
        console.error("WebSocket message error:", err);
        sendJSON(ws, { type: "error", message: err.message });
      } finally {
        isProcessing = false;
      }
    });

    ws.on("close", () => {
      console.log("WebSocket client disconnected");
    });
  });
}

async function handleMessage(ws, msg) {
  switch (msg.type) {
    case "start":
      await handleStart(ws, msg);
      break;
    case "continue":
      await handleContinue(ws, msg);
      break;
    default:
      sendJSON(ws, { type: "error", message: `Unknown message type: ${msg.type}` });
  }
}

function sanitizeText(text, maxLength = 500) {
  if (typeof text !== "string") return "";
  return text.slice(0, maxLength).replace(/[<>]/g, "");
}

function validateConcept(concept) {
  if (!concept || typeof concept !== "object") return "Invalid concept object";
  if (typeof concept.genre !== "string" || !concept.genre.trim()) return "Missing genre";
  if (typeof concept.setting !== "string" || !concept.setting.trim()) return "Missing setting";
  if (typeof concept.tone !== "string" || !concept.tone.trim()) return "Missing tone";
  if (!Array.isArray(concept.characters) || concept.characters.length === 0) return "Missing characters";
  if (concept.characters.length > config.maxCharacters) return `Maximum ${config.maxCharacters} characters allowed`;

  for (const char of concept.characters) {
    if (!char || typeof char.name !== "string" || !char.name.trim()) return "Each character needs a name";
    if (typeof char.description !== "string" || !char.description.trim()) return "Each character needs a description";
  }

  if (concept.setting.length > config.maxSettingLength) return `Setting must be under ${config.maxSettingLength} characters`;
  return null;
}

function sanitizeConcept(concept) {
  return {
    genre: sanitizeText(concept.genre, 50),
    setting: sanitizeText(concept.setting, config.maxSettingLength),
    tone: sanitizeText(concept.tone, 50),
    characters: concept.characters.slice(0, config.maxCharacters).map((c) => ({
      name: sanitizeText(c.name, 100),
      role: sanitizeText(c.role || "Character", 100),
      description: sanitizeText(c.description, 500),
    })),
  };
}

async function handleStart(ws, msg) {
  const { storyId, concept } = msg;

  if (!storyId || typeof storyId !== "string") {
    sendJSON(ws, { type: "error", message: "Missing or invalid storyId" });
    return;
  }

  const validationError = validateConcept(concept);
  if (validationError) {
    sendJSON(ws, { type: "error", message: validationError });
    return;
  }

  const safeConcept = sanitizeConcept(concept);

  sendJSON(ws, { type: "status", message: "Generating Chapter 1..." });

  try {
    const parts = await generateChapter(safeConcept, 1, null, null);
    const processedParts = await processAndStreamParts(ws, parts);

    await db.addChapter(storyId, {
      number: 1,
      parts: processedParts,
      decision: null,
    });

    sendJSON(ws, { type: "chapter_end", chapter: 1 });
  } catch (err) {
    console.error("Generation error:", err);
    sendJSON(ws, { type: "error", message: "Failed to generate chapter. Please try again." });
  }
}

async function handleContinue(ws, msg) {
  const { storyId, decision } = msg;

  if (!storyId || typeof storyId !== "string") {
    sendJSON(ws, { type: "error", message: "Missing or invalid storyId" });
    return;
  }

  if (!decision || typeof decision !== "string") {
    sendJSON(ws, { type: "error", message: "Missing or invalid decision" });
    return;
  }

  const safeDecision = sanitizeText(decision, config.maxDecisionLength);

  try {
    const story = await db.getStory(storyId);
    if (!story) {
      sendJSON(ws, { type: "error", message: "Story not found" });
      return;
    }

    const chapters = story.chapters || [];

    if (chapters.length >= config.maxChaptersPerStory) {
      sendJSON(ws, { type: "error", message: "Story has reached the maximum number of chapters" });
      return;
    }

    const chapterNumber = chapters.length + 1;

    // Update the last chapter with the decision taken
    if (chapters.length > 0) {
      chapters[chapters.length - 1].decision = safeDecision;
      await db.updateStory(storyId, { chapters });
    }

    // Build summary from previous chapters
    const previousSummary = buildSummary(chapters);

    sendJSON(ws, { type: "status", message: `Generating Chapter ${chapterNumber}...` });

    const parts = await generateChapter(story.concept, chapterNumber, previousSummary, safeDecision);
    const processedParts = await processAndStreamParts(ws, parts);

    await db.addChapter(storyId, {
      number: chapterNumber,
      parts: processedParts,
      decision: null,
    });

    sendJSON(ws, { type: "chapter_end", chapter: chapterNumber });
  } catch (err) {
    console.error("Continue error:", err);
    sendJSON(ws, { type: "error", message: "Failed to continue story. Please try again." });
  }
}

async function processAndStreamParts(ws, parts) {
  const processed = [];

  for (const part of parts) {
    if (part.type === "text") {
      sendJSON(ws, { type: "text", content: part.content });

      // Generate narration in background with proper error handling
      generateNarration(part.content)
        .then((audioUrl) => {
          if (audioUrl) {
            sendJSON(ws, { type: "audio", url: audioUrl });
          }
        })
        .catch((err) => {
          console.warn("Background TTS failed:", err.message);
        });

      processed.push({ type: "text", content: part.content });
    } else if (part.type === "image") {
      try {
        const url = await uploadImage(part.data, part.mimeType);
        sendJSON(ws, { type: "image", url });
        processed.push({ type: "image", url });
      } catch (err) {
        console.warn("Image upload failed, using inline fallback:", err.message);
        // Truncate base64 for Firestore storage (don't persist huge data URIs)
        const dataUrl = `data:${part.mimeType};base64,${part.data}`;
        sendJSON(ws, { type: "image", url: dataUrl });
        // Store a placeholder URL instead of massive base64 in Firestore
        processed.push({ type: "image", url: "/image-unavailable.png" });
      }
    } else if (part.type === "decision") {
      sendJSON(ws, {
        type: "decision",
        prompt: part.prompt,
        suggestions: part.suggestions,
      });
      processed.push(part);
    }
  }

  return processed;
}

function buildSummary(chapters) {
  return chapters
    .map((ch) => {
      const texts = ch.parts
        .filter((p) => p.type === "text")
        .map((p) => p.content)
        .join(" ");
      const decisionText = ch.decision ? `\nReader chose: "${ch.decision}"` : "";
      return `Chapter ${ch.number}: ${texts.slice(0, 500)}...${decisionText}`;
    })
    .join("\n\n");
}

function sendJSON(ws, data) {
  if (ws.readyState === ws.OPEN) {
    try {
      ws.send(JSON.stringify(data));
    } catch (err) {
      console.warn("Failed to send WebSocket message:", err.message);
    }
  }
}

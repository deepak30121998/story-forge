import { GoogleGenAI } from "@google/genai";
import { config } from "../config.js";
import {
  buildSystemPrompt,
  buildChapterPrompt,
  buildTitlePrompt,
} from "../prompts/storyteller.js";

const ai = new GoogleGenAI({ apiKey: config.googleApiKey });

export async function generateStoryTitle(concept) {
  try {
    const response = await ai.models.generateContent({
      model: config.geminiModel,
      contents: buildTitlePrompt(concept),
    });

    const text = response?.text || response?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error("Empty response from Gemini for title generation");
    }
    return text.trim().slice(0, 200);
  } catch (err) {
    console.error("Title generation failed:", err);
    throw new Error(`Gemini title generation failed: ${err.message}`);
  }
}

export async function generateChapter(concept, chapterNumber, previousSummary, decision) {
  const systemPrompt = buildSystemPrompt(concept);
  const userPrompt = buildChapterPrompt(chapterNumber, previousSummary, decision);

  try {
    const response = await ai.models.generateContent({
      model: config.geminiModel,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseModalities: ["TEXT", "IMAGE"],
        temperature: 0.9,
      },
    });

    const parts = parseInterleavedResponse(response);
    if (parts.length === 0) {
      throw new Error("Gemini returned empty response for chapter generation");
    }
    return parts;
  } catch (err) {
    console.error("Chapter generation failed:", err);
    throw new Error(`Gemini chapter generation failed: ${err.message}`);
  }
}

function parseInterleavedResponse(response) {
  const parts = [];
  const candidate = response?.candidates?.[0];

  if (!candidate?.content?.parts) {
    // Fallback: try response.text for text-only responses
    const fallbackText = response?.text;
    if (fallbackText) {
      return parseTextWithDecisions(fallbackText);
    }
    return parts;
  }

  let textBuffer = "";

  for (const part of candidate.content.parts) {
    if (part.text) {
      textBuffer += part.text;
    } else if (part.inlineData) {
      // Flush text buffer before image
      if (textBuffer) {
        parts.push(...parseTextWithDecisions(textBuffer));
        textBuffer = "";
      }
      parts.push({
        type: "image",
        data: part.inlineData.data,
        mimeType: part.inlineData.mimeType,
      });
    }
  }

  // Flush remaining text
  if (textBuffer) {
    parts.push(...parseTextWithDecisions(textBuffer));
  }

  return parts;
}

function parseTextWithDecisions(text) {
  const parts = [];

  if (text.includes("---DECISION---")) {
    const beforeDecision = text.split("---DECISION---")[0].trim();
    if (beforeDecision) {
      parts.push({ type: "text", content: beforeDecision });
    }

    const decisionBlock = text.split("---DECISION---")[1] || "";
    const decisionText = decisionBlock.replace("---END_DECISION---", "").trim();
    if (decisionText) {
      parts.push(parseDecision(decisionText));
    }
  } else {
    parts.push({ type: "text", content: text });
  }

  return parts;
}

function parseDecision(text) {
  const lines = text.split("\n").filter((l) => l.trim());
  const prompt = lines[0]?.replace(/^\[|\]$/g, "").trim() || "What do you do?";
  const suggestions = [];

  for (const line of lines.slice(1)) {
    const match = line.match(/^\d+\.\s*(.+)/);
    if (match) {
      suggestions.push(match[1].replace(/^\[|\]$/g, "").trim());
    }
  }

  if (suggestions.length === 0) {
    suggestions.push("Continue forward", "Take a different path", "Wait and observe");
  }

  return { type: "decision", prompt, suggestions };
}

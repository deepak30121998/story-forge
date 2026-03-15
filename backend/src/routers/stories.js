import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import * as db from "../services/firestore.js";
import { generateStoryTitle } from "../services/gemini.js";
import { config } from "../config.js";

const router = Router();

const ALLOWED_GENRES = [
  "Fantasy", "Sci-Fi", "Mystery", "Romance", "Horror",
  "Adventure", "Historical", "Mythology",
];

const ALLOWED_TONES = [
  "Epic", "Whimsical", "Dark", "Lighthearted",
  "Suspenseful", "Romantic", "Philosophical", "Humorous",
];

function sanitize(str, maxLen = 200) {
  if (typeof str !== "string") return "";
  return str.slice(0, maxLen).replace(/[<>]/g, "");
}

router.post("/", async (req, res) => {
  try {
    const { genre, characters, setting, tone } = req.body;

    // Type validation
    if (typeof genre !== "string" || typeof setting !== "string" || typeof tone !== "string") {
      return res.status(400).json({ error: "genre, setting, and tone must be strings" });
    }

    if (!Array.isArray(characters) || characters.length === 0) {
      return res.status(400).json({ error: "characters must be a non-empty array" });
    }

    if (characters.length > config.maxCharacters) {
      return res.status(400).json({ error: `Maximum ${config.maxCharacters} characters allowed` });
    }

    // Validate enum values
    if (!ALLOWED_GENRES.includes(genre)) {
      return res.status(400).json({ error: `Invalid genre. Allowed: ${ALLOWED_GENRES.join(", ")}` });
    }

    if (!ALLOWED_TONES.includes(tone)) {
      return res.status(400).json({ error: `Invalid tone. Allowed: ${ALLOWED_TONES.join(", ")}` });
    }

    if (setting.length < 10 || setting.length > config.maxSettingLength) {
      return res.status(400).json({ error: `Setting must be between 10 and ${config.maxSettingLength} characters` });
    }

    // Validate each character
    for (const char of characters) {
      if (!char || typeof char !== "object") {
        return res.status(400).json({ error: "Each character must be an object" });
      }
      if (typeof char.name !== "string" || !char.name.trim()) {
        return res.status(400).json({ error: "Each character must have a name" });
      }
      if (typeof char.description !== "string" || !char.description.trim()) {
        return res.status(400).json({ error: "Each character must have a description" });
      }
    }

    // Sanitize inputs
    const concept = {
      genre: sanitize(genre, 50),
      setting: sanitize(setting, config.maxSettingLength),
      tone: sanitize(tone, 50),
      characters: characters.slice(0, config.maxCharacters).map((c) => ({
        name: sanitize(c.name, 100),
        role: sanitize(c.role || "Character", 100),
        description: sanitize(c.description, 500),
      })),
    };

    const title = await generateStoryTitle(concept);
    const id = uuidv4();

    const story = await db.createStory({
      id,
      title,
      concept,
      chapters: [],
      status: "in_progress",
    });

    res.status(201).json(story);
  } catch (err) {
    console.error("Create story error:", err);
    res.status(500).json({ error: "Failed to create story" });
  }
});

router.get("/", async (_req, res) => {
  try {
    const stories = await db.listStories();
    res.json(stories);
  } catch (err) {
    console.error("List stories error:", err);
    res.status(500).json({ error: "Failed to list stories" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const storyId = sanitize(req.params.id, 50);
    const story = await db.getStory(storyId);
    if (!story) return res.status(404).json({ error: "Story not found" });
    res.json(story);
  } catch (err) {
    console.error("Get story error:", err);
    res.status(500).json({ error: "Failed to get story" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const storyId = sanitize(req.params.id, 50);
    await db.deleteStory(storyId);
    res.json({ success: true });
  } catch (err) {
    console.error("Delete story error:", err);
    res.status(500).json({ error: "Failed to delete story" });
  }
});

export default router;

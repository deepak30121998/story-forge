import { Router } from "express";
import { createStorytellerAgent, STORYTELLER_PERSONA } from "../agent/storyteller-agent.js";

const router = Router();

// Agent info endpoint — shows ADK agent configuration for judges
router.get("/info", (_req, res) => {
  const agent = createStorytellerAgent();

  res.json({
    name: agent.name,
    description: agent.description,
    model: agent.model,
    persona: "Ignis, the Story Forge",
    framework: "Google ADK (Agent Development Kit) v0.5.0",
    tools: [
      {
        name: "generate_illustration",
        description: "Generates AI illustrations at key story moments using Gemini's interleaved image output",
      },
      {
        name: "generate_narration",
        description: "Creates voice narration using Google Cloud Text-to-Speech with Studio voices",
      },
      {
        name: "store_memory",
        description: "Stores story details (character arcs, plot threads, foreshadowing) for continuity across chapters",
      },
      {
        name: "recall_memory",
        description: "Retrieves stored story context before generating new chapters",
      },
      {
        name: "save_chapter",
        description: "Persists completed chapters to Firestore database",
      },
    ],
    capabilities: [
      "Interleaved text + image generation",
      "Multi-chapter story memory and continuity",
      "Interactive decision-based branching",
      "Voice narration with Google Cloud TTS",
      "Distinct persona with genre-adaptive voice",
    ],
    googleCloud: {
      services: [
        "Cloud Run (hosting)",
        "Cloud Storage (media assets)",
        "Firestore (story persistence)",
        "Cloud Text-to-Speech (narration)",
      ],
      sdk: "@google/genai v1.45.0",
      adk: "@google/adk v0.5.0",
    },
  });
});

// Agent persona endpoint
router.get("/persona", (_req, res) => {
  res.json({
    name: "Ignis",
    title: "The Story Forge",
    description:
      "An ancient, wise, and charismatic storyteller who has lived through a thousand lifetimes.",
    voice: "Adapts to genre — dark and brooding for horror, sweeping for fantasy, sharp for mystery",
    instruction: STORYTELLER_PERSONA,
  });
});

export default router;

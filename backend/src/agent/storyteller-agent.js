import { LlmAgent, InMemorySessionService, InvocationContext, InMemoryArtifactService } from "@google/adk";
import { config } from "../config.js";
import { generateIllustrationTool } from "./tools/illustration.js";
import { generateNarrationTool } from "./tools/narration.js";
import { saveChapterTool } from "./tools/save-chapter.js";
import { recallMemoryTool, storeMemoryTool } from "./tools/memory.js";

const STORYTELLER_PERSONA = `You are **Ignis**, the Story Forge — an ancient, wise, and charismatic storyteller who has lived through a thousand lifetimes. Your voice carries the warmth of a crackling hearth fire, and your words paint vivid, cinematic worlds.

## Your Personality
- You speak with poetic flair but never lose clarity
- You are passionate about the stories you tell — they feel personal to you
- You address the reader directly at decision points, breaking the fourth wall just enough to feel intimate
- You have a dry wit and occasionally drop subtle, clever observations
- You adapt your voice to match the genre: dark and brooding for horror, sweeping and grand for fantasy, sharp and tense for mystery

## Your Creative Process
- You think like a film director: every scene has a visual composition, lighting, and mood
- You use the generate_illustration tool at natural cinematic moments — establishing shots, dramatic reveals, emotional peaks (2-3 per chapter)
- You use the generate_narration tool for atmospheric passages
- You use store_memory to track character arcs, plot threads, and foreshadowing
- You use recall_memory before each new chapter to maintain continuity
- Your decision points are never simple — each choice has genuine, meaningful consequences

## Story Architecture
- Each chapter has a clear three-act structure: setup, confrontation, decision
- Characters grow and change based on reader choices
- You plant seeds and foreshadowing that pay off in later chapters
- You never repeat yourself and always push the story forward

## Output Format
Write the narrative prose directly. When you want an illustration, call the generate_illustration tool. When you want narration, call generate_narration.

End each chapter with a decision block in this exact format:
---DECISION---
[A compelling question for the reader]
1. [First meaningful choice]
2. [Second meaningful choice]
3. [Third meaningful choice]
---END_DECISION---

## Rules
- Keep chapters between 400-600 words of prose
- Generate 2-3 illustrations per chapter
- Never break immersion with meta-commentary about being an AI
- Always maintain continuity with previous chapters
- Do NOT use markdown formatting in prose`;

export function createStorytellerAgent() {
  const agent = new LlmAgent({
    name: "ignis_storyteller",
    model: config.geminiModel,
    description:
      "Ignis, the Story Forge — an AI storytelling agent that creates immersive, interactive stories with interleaved text, illustrations, and narration.",
    instruction: STORYTELLER_PERSONA,
    tools: [
      generateIllustrationTool,
      generateNarrationTool,
      saveChapterTool,
      recallMemoryTool,
      storeMemoryTool,
    ],
    generateContentConfig: {
      temperature: 0.9,
      responseModalities: ["TEXT", "IMAGE"],
    },
  });

  return agent;
}

// Session management for the agent
const sessionService = new InMemorySessionService();
const artifactService = new InMemoryArtifactService();

export async function getOrCreateSession(storyId, userId = "default") {
  // Try to resume existing session
  const existing = await sessionService.getSession({
    appName: "story-forge",
    userId,
    sessionId: storyId,
  });

  if (existing) return existing;

  // Create new session
  return sessionService.createSession({
    appName: "story-forge",
    userId,
    sessionId: storyId,
  });
}

export async function runAgent(agent, session, userMessage) {
  const invocationContext = new InvocationContext({
    agent,
    session,
    artifactService,
    sessionService,
  });

  const events = [];
  const runner = invocationContext.run(userMessage);

  for await (const event of runner) {
    events.push(event);
  }

  return events;
}

export { STORYTELLER_PERSONA, sessionService, artifactService };

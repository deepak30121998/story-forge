import { FunctionTool } from "@google/adk";

// In-memory story memory store
const storyMemories = new Map();

export const storeMemoryTool = new FunctionTool({
  name: "store_memory",
  description:
    "Store an important story detail for future reference. Use this to track: character development, plot threads, foreshadowing seeds, reader preferences based on their choices, and world-building details. This ensures continuity across chapters.",

  async execute({ story_id, category, key, content }) {
    if (!storyMemories.has(story_id)) {
      storyMemories.set(story_id, []);
    }

    const memories = storyMemories.get(story_id);
    const existingIdx = memories.findIndex((m) => m.key === key);
    const entry = { category, key, content, updatedAt: new Date().toISOString() };

    if (existingIdx >= 0) {
      memories[existingIdx] = entry;
    } else {
      memories.push(entry);
    }

    return { success: true, totalMemories: memories.length };
  },
});

export const recallMemoryTool = new FunctionTool({
  name: "recall_memory",
  description:
    "Recall stored story details to maintain continuity. Use this before writing a new chapter to remember character arcs, unresolved plot threads, foreshadowing, and reader preferences.",

  async execute({ story_id, category }) {
    const memories = storyMemories.get(story_id) || [];

    if (!category || category === "all") {
      return { memories, count: memories.length };
    }

    const filtered = memories.filter((m) => m.category === category);
    return { memories: filtered, count: filtered.length };
  },
});

export function getStoryMemories(storyId) {
  return storyMemories.get(storyId) || [];
}

export function clearStoryMemories(storyId) {
  storyMemories.delete(storyId);
}

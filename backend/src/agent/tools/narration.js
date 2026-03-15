import { FunctionTool } from "@google/adk";
import { generateNarration } from "../../services/tts.js";

export const generateNarrationTool = new FunctionTool({
  name: "generate_narration",
  description:
    "Generate audio narration for a passage of story text. Use this after writing a particularly atmospheric or emotional passage to enhance immersion with voice narration.",

  async execute({ text }) {
    try {
      const url = await generateNarration(text);
      if (url) {
        return { success: true, url };
      }
      return { success: false, error: "TTS unavailable" };
    } catch (err) {
      console.error("Narration generation failed:", err.message);
      return { success: false, error: err.message };
    }
  },
});

import { FunctionTool } from "@google/adk";
import * as db from "../../services/firestore.js";

export const saveChapterTool = new FunctionTool({
  name: "save_chapter",
  description:
    "Save a completed chapter to the story database. Call this after finishing a chapter with all its text, images, and the decision point.",

  async execute({ story_id, chapter_number, summary }) {
    try {
      await db.addChapter(story_id, {
        number: chapter_number,
        parts: [],
        decision: null,
        summary: summary || "",
      });
      return { success: true, message: `Chapter ${chapter_number} saved.` };
    } catch (err) {
      console.error("Save chapter failed:", err.message);
      return { success: false, error: err.message };
    }
  },
});

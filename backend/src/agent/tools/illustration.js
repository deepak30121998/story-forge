import { FunctionTool } from "@google/adk";
import { GoogleGenAI } from "@google/genai";
import { config } from "../../config.js";
import { uploadImage } from "../../services/storage.js";

const ai = new GoogleGenAI({ apiKey: config.googleApiKey });

export const generateIllustrationTool = new FunctionTool({
  name: "generate_illustration",
  description:
    "Generate an illustration for the story. Use this at key visual moments: scene introductions, dramatic reveals, character appearances, and emotional peaks. Describe the scene vividly.",

  async execute({ scene_description, style }) {
    try {
      const prompt = `Create a ${style || "digital painting"} illustration: ${scene_description}. No text or words in the image.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: prompt,
        config: {
          responseModalities: ["IMAGE"],
          temperature: 0.8,
        },
      });

      const candidate = response?.candidates?.[0];
      if (!candidate?.content?.parts) {
        return { success: false, error: "No image generated" };
      }

      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          try {
            const url = await uploadImage(part.inlineData.data, part.inlineData.mimeType);
            return { success: true, url, description: scene_description };
          } catch {
            return {
              success: true,
              url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
              description: scene_description,
            };
          }
        }
      }

      return { success: false, error: "No image data in response" };
    } catch (err) {
      console.error("Illustration generation failed:", err.message);
      return { success: false, error: err.message };
    }
  },
});

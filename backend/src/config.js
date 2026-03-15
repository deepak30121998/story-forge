import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "8080"),
  googleApiKey: process.env.GOOGLE_API_KEY,
  gcpProject: process.env.GOOGLE_CLOUD_PROJECT,
  gcsBucket: process.env.GCS_BUCKET_NAME || "story-forge-media",
  geminiModel: "gemini-2.5-flash-image",
  allowedOrigins: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : ["http://localhost:3000"],
  maxDecisionLength: 500,
  maxSettingLength: 2000,
  maxCharacters: 4,
  maxChaptersPerStory: 20,
};

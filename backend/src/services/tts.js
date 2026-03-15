import textToSpeech from "@google-cloud/text-to-speech";
import { uploadAudio } from "./storage.js";

const client = new textToSpeech.TextToSpeechClient();

export async function generateNarration(text) {
  try {
    const [response] = await client.synthesizeSpeech({
      input: { text },
      voice: {
        languageCode: "en-US",
        name: "en-US-Studio-O",
        ssmlGender: "FEMALE",
      },
      audioConfig: {
        audioEncoding: "MP3",
        speakingRate: 0.95,
        pitch: 0,
      },
    });

    const url = await uploadAudio(response.audioContent, "mp3");
    return url;
  } catch (err) {
    console.warn("TTS generation failed:", err.message);
    return null;
  }
}

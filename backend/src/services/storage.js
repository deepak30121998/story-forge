import { config } from "../config.js";
import { v4 as uuidv4 } from "uuid";
import fs from "fs/promises";
import path from "path";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
let useLocal = false;
let bucket;

const LOCAL_MEDIA_DIR = path.join(process.cwd(), "media");

async function getStorage() {
  if (bucket) return { type: "gcs", bucket };

  if (!config.gcpProject) {
    useLocal = true;
    await fs.mkdir(path.join(LOCAL_MEDIA_DIR, "images"), { recursive: true });
    await fs.mkdir(path.join(LOCAL_MEDIA_DIR, "audio"), { recursive: true });
    return { type: "local" };
  }

  try {
    const { Storage } = await import("@google-cloud/storage");
    const storage = new Storage({ projectId: config.gcpProject });
    bucket = storage.bucket(config.gcsBucket);
    return { type: "gcs", bucket };
  } catch (err) {
    console.warn("GCS unavailable, using local storage:", err.message);
    useLocal = true;
    await fs.mkdir(path.join(LOCAL_MEDIA_DIR, "images"), { recursive: true });
    await fs.mkdir(path.join(LOCAL_MEDIA_DIR, "audio"), { recursive: true });
    return { type: "local" };
  }
}

export async function uploadImage(imageData, mimeType) {
  if (!imageData || typeof imageData !== "string") {
    throw new Error("Invalid image data");
  }

  const buffer = Buffer.from(imageData, "base64");
  if (buffer.length > MAX_IMAGE_SIZE) {
    throw new Error("Image exceeds maximum size");
  }

  const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
  const safeMime = allowedTypes.includes(mimeType) ? mimeType : "image/png";
  const extension = safeMime.split("/")[1];
  const filename = `${uuidv4()}.${extension}`;

  const store = await getStorage();
  if (store.type === "local") {
    const filePath = path.join(LOCAL_MEDIA_DIR, "images", filename);
    await fs.writeFile(filePath, buffer);
    return `http://localhost:${config.port}/media/images/${filename}`;
  }

  const file = store.bucket.file(`stories/images/${filename}`);
  await file.save(buffer, {
    metadata: { contentType: safeMime },
    public: true,
  });
  return `https://storage.googleapis.com/${config.gcsBucket}/stories/images/${filename}`;
}

export async function uploadAudio(audioBuffer, encoding = "mp3") {
  if (!audioBuffer || !Buffer.isBuffer(audioBuffer)) {
    throw new Error("Invalid audio buffer");
  }

  const filename = `${uuidv4()}.${encoding}`;

  const store = await getStorage();
  if (store.type === "local") {
    const filePath = path.join(LOCAL_MEDIA_DIR, "audio", filename);
    await fs.writeFile(filePath, audioBuffer);
    return `http://localhost:${config.port}/media/audio/${filename}`;
  }

  const file = store.bucket.file(`stories/audio/${filename}`);
  await file.save(audioBuffer, {
    metadata: { contentType: `audio/${encoding}` },
    public: true,
  });
  return `https://storage.googleapis.com/${config.gcsBucket}/stories/audio/${filename}`;
}

export async function ensureBucket() {
  const store = await getStorage();
  if (store.type === "local") {
    console.log(`Using local media storage at ${LOCAL_MEDIA_DIR}`);
    return;
  }

  try {
    const [exists] = await store.bucket.exists();
    if (!exists) {
      const { Storage } = await import("@google-cloud/storage");
      const storage = new Storage({ projectId: config.gcpProject });
      await storage.createBucket(config.gcsBucket, {
        location: "US",
        uniformBucketLevelAccess: { enabled: true },
      });
      await store.bucket.makePublic();
      console.log(`Bucket ${config.gcsBucket} created.`);
    }
  } catch (err) {
    console.warn("Bucket setup skipped:", err.message);
  }
}

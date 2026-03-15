import { config } from "../config.js";

// Use Firestore if GCP project is configured, otherwise fall back to in-memory store
let storiesRef;
let useInMemory = false;
const memoryStore = new Map();

async function getStore() {
  if (storiesRef) return { type: "firestore", ref: storiesRef };

  if (!config.gcpProject) {
    console.log("No GOOGLE_CLOUD_PROJECT set — using in-memory storage");
    useInMemory = true;
    return { type: "memory" };
  }

  try {
    const { Firestore } = await import("@google-cloud/firestore");
    const db = new Firestore({ projectId: config.gcpProject });
    storiesRef = db.collection("stories");
    return { type: "firestore", ref: storiesRef };
  } catch (err) {
    console.warn("Firestore unavailable, using in-memory storage:", err.message);
    useInMemory = true;
    return { type: "memory" };
  }
}

export async function createStory(storyData) {
  const now = new Date().toISOString();
  const fullData = {
    ...storyData,
    createdAt: now,
    updatedAt: now,
  };

  const store = await getStore();
  if (store.type === "memory") {
    memoryStore.set(storyData.id, fullData);
  } else {
    const { Firestore } = await import("@google-cloud/firestore");
    await store.ref.doc(storyData.id).set({
      ...storyData,
      createdAt: Firestore.Timestamp.now(),
      updatedAt: Firestore.Timestamp.now(),
    });
  }

  return fullData;
}

export async function getStory(storyId) {
  const store = await getStore();
  if (store.type === "memory") {
    return memoryStore.get(storyId) || null;
  }

  const doc = await store.ref.doc(storyId).get();
  if (!doc.exists) return null;
  return serializeStory(doc);
}

export async function updateStory(storyId, updates) {
  const store = await getStore();
  if (store.type === "memory") {
    const existing = memoryStore.get(storyId);
    if (!existing) throw new Error("Story not found");
    memoryStore.set(storyId, { ...existing, ...updates, updatedAt: new Date().toISOString() });
    return;
  }

  const { Firestore } = await import("@google-cloud/firestore");
  await store.ref.doc(storyId).update({
    ...updates,
    updatedAt: Firestore.Timestamp.now(),
  });
}

export async function addChapter(storyId, chapter) {
  const story = await getStory(storyId);
  if (!story) throw new Error("Story not found");

  const chapters = story.chapters || [];
  chapters.push(chapter);

  await updateStory(storyId, { chapters });
  return chapter;
}

export async function listStories(limit = 20) {
  const store = await getStore();
  if (store.type === "memory") {
    const all = Array.from(memoryStore.values());
    all.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    return all.slice(0, Math.min(limit, 100));
  }

  const safeLimit = Math.min(Math.max(1, limit), 100);
  const snapshot = await store.ref
    .orderBy("createdAt", "desc")
    .limit(safeLimit)
    .get();

  return snapshot.docs.map(serializeStory);
}

export async function deleteStory(storyId) {
  const store = await getStore();
  if (store.type === "memory") {
    memoryStore.delete(storyId);
    return;
  }
  await store.ref.doc(storyId).delete();
}

function serializeStory(doc) {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
  };
}

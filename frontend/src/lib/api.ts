const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

async function fetchJSON(url: string, options?: RequestInit) {
  const res = await fetch(url, {
    ...options,
    headers: {
      ...options?.headers,
      "Cache-Control": "no-cache",
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Request failed: ${res.status}`);
  }

  return res.json();
}

export async function createStory(concept: {
  genre: string;
  characters: { name: string; role: string; description: string }[];
  setting: string;
  tone: string;
}) {
  return fetchJSON(`${API_URL}/api/stories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(concept),
  });
}

export async function getStory(id: string) {
  return fetchJSON(`${API_URL}/api/stories/${encodeURIComponent(id)}`);
}

export async function listStories() {
  return fetchJSON(`${API_URL}/api/stories`);
}

export async function deleteStory(id: string) {
  return fetchJSON(`${API_URL}/api/stories/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export function getWebSocketURL() {
  const base = API_URL.replace(/^http/, "ws");
  return `${base}/ws`;
}

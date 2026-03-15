export interface Character {
  name: string;
  role: string;
  description: string;
}

export interface StoryConcept {
  genre: string;
  characters: Character[];
  setting: string;
  tone: string;
}

export interface StoryPart {
  type: "text" | "image" | "audio" | "decision" | "status";
  content?: string;
  url?: string;
  prompt?: string;
  suggestions?: string[];
  message?: string;
}

export interface Chapter {
  number: number;
  parts: StoryPart[];
  decision: string | null;
}

export interface Story {
  id: string;
  title: string;
  concept: StoryConcept;
  chapters: Chapter[];
  status: "in_progress" | "complete";
  createdAt?: string;
}

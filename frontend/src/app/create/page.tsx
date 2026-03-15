"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { StoryCreator } from "@/components/StoryCreator";
import { createStory } from "@/lib/api";
import { Character } from "@/types/story";
import Link from "next/link";
import { ParticleField } from "@/components/ParticleField";

export default function CreatePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (concept: {
    genre: string;
    characters: Character[];
    setting: string;
    tone: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const story = await createStory(concept);
      router.push(`/story/${story.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create story");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative px-6 py-8">
      <ParticleField />

      <div className="relative z-10 max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-10 group"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-hover:-translate-x-1">
            <path d="M19 12H5m7-7l-7 7 7 7" />
          </svg>
          Back to stories
        </Link>

        <div className="text-center mb-14 animate-slide-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/30 mb-6">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent">
              <path d="M20.24 12.24a6 6 0 00-8.49-8.49L5 10.5V19h8.5z" />
              <path d="M16 8L2 22" />
              <path d="M17.5 15H9" />
            </svg>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-3">
            <span className="bg-gradient-to-r from-accent via-primary to-purple-400 bg-clip-text text-transparent">
              Forge a New Story
            </span>
          </h1>
          <p className="text-muted text-lg max-w-md mx-auto">
            Define your world, characters, and tone — then watch AI bring it to life.
          </p>
        </div>

        {error && (
          <div className="mb-8 glass rounded-2xl p-4 border-red-500/30 animate-fade-in-scale">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400">
                  <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6m0-6l6 6" />
                </svg>
              </div>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          </div>
        )}

        <StoryCreator onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState, useCallback, useRef, use } from "react";
import Link from "next/link";
import { Story } from "@/types/story";
import { getStory } from "@/lib/api";
import { useStoryStream } from "@/hooks/useStoryStream";
import { StoryReader } from "@/components/StoryReader";

export default function StoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [story, setStory] = useState<Story | null>(null);
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);
  const { parts, status, currentChapter, startStory, continueStory, disconnect } =
    useStoryStream();

  useEffect(() => {
    startedRef.current = false;
    setError(null);

    getStory(id)
      .then(setStory)
      .catch((err) => {
        console.error("Failed to load story:", err);
        setError("Failed to load story. Please try again.");
      });

    return () => disconnect();
  }, [id, disconnect]);

  useEffect(() => {
    if (story && !startedRef.current && story.chapters.length === 0) {
      startedRef.current = true;
      startStory(story.id, story.concept);
    }
  }, [story, startStory]);

  const handleDecision = useCallback(
    (choice: string) => {
      continueStory(id, choice);
    },
    [id, continueStory]
  );

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center glass rounded-3xl p-10 max-w-md animate-fade-in-scale">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400">
              <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6m0-6l6 6" />
            </svg>
          </div>
          <p className="text-red-400 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-surface hover:bg-surface-hover border border-border rounded-xl text-sm transition-all"
          >
            Back to stories
          </Link>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/30 flex items-center justify-center animate-pulse-glow">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent animate-float">
            <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <p className="text-sm text-muted">Loading your story...</p>
      </div>
    );
  }

  const persistedParts = story.chapters.flatMap((ch) => ch.parts);
  const allParts = startedRef.current ? parts : persistedParts;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 glass-strong">
        <div className="max-w-3xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors group"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-hover:-translate-x-1">
              <path d="M19 12H5m7-7l-7 7 7 7" />
            </svg>
            Stories
          </Link>

          <div className="flex-1 mx-6 text-center">
            <h1 className="text-sm font-bold truncate">{story.title}</h1>
          </div>

          <div className="flex items-center gap-2">
            {currentChapter > 0 && (
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-surface-hover text-muted font-medium">
                Ch. {currentChapter}
              </span>
            )}
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-primary/15 text-accent font-medium">
              {story.concept.genre}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        {(status === "generating" || status === "connecting") && (
          <div className="h-0.5 bg-border">
            <div className="h-full bg-gradient-to-r from-primary to-accent animate-shimmer" style={{ width: "60%", backgroundSize: "200% 100%" }} />
          </div>
        )}
      </header>

      {/* Story Content */}
      <StoryReader
        parts={allParts}
        onDecision={handleDecision}
        isGenerating={status === "generating" || status === "connecting"}
      />

      {/* Resume reading for existing stories */}
      {!startedRef.current && story.chapters.length > 0 && (
        <div className="text-center py-12 animate-fade-in">
          <button
            onClick={() => {
              startedRef.current = true;
              setStory({ ...story });
            }}
            className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-accent rounded-2xl text-white font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/30"
          >
            Continue Reading
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-hover:translate-x-1">
              <path d="M5 12h14m-7-7l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

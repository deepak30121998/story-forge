"use client";
import { useEffect, useRef, useState } from "react";
import { StoryPart } from "@/types/story";
import { DecisionPoint } from "./DecisionPoint";
import { AudioPlayer } from "./AudioPlayer";

interface StoryReaderProps {
  parts: StoryPart[];
  onDecision: (choice: string) => void;
  isGenerating: boolean;
}

export function StoryReader({
  parts,
  onDecision,
  isGenerating,
}: StoryReaderProps) {
  const endRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    // Animate parts appearing one by one
    if (parts.length > visibleCount) {
      const timer = setTimeout(() => {
        setVisibleCount(parts.length);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [parts.length, visibleCount]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleCount]);

  return (
    <article className="max-w-3xl mx-auto px-6 py-12">
      {/* Chapter divider */}
      {parts.length > 0 && parts[0]?.type !== "status" && (
        <div className="flex items-center gap-4 mb-10 animate-fade-in">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          <div className="flex items-center gap-2 text-accent text-xs font-semibold uppercase tracking-widest">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Chapter
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-border via-transparent to-transparent" />
        </div>
      )}

      {parts.slice(0, visibleCount).map((part, i) => {
        const key = `${part.type}-${i}`;

        switch (part.type) {
          case "text":
            return (
              <div key={key} className="prose-story animate-fade-in mb-2">
                {(part.content || "").split("\n").map((paragraph, j) =>
                  paragraph.trim() ? (
                    <p key={`${key}-p-${j}`} className="animate-fade-in" style={{ animationDelay: `${j * 0.05}s` }}>
                      {paragraph}
                    </p>
                  ) : null
                )}
              </div>
            );

          case "image":
            return part.url ? (
              <div key={key} className="my-10 animate-image-reveal">
                <div className="relative rounded-2xl overflow-hidden group">
                  {/* Glow effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-primary/10">
                    <img
                      src={part.url}
                      alt="Story illustration"
                      className="w-full h-auto transition-transform duration-700 group-hover:scale-[1.02]"
                      loading="lazy"
                    />
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
              </div>
            ) : null;

          case "audio":
            return part.url ? (
              <div key={key} className="my-4 animate-fade-in">
                <AudioPlayer src={part.url} />
              </div>
            ) : null;

          case "decision":
            return part.prompt && part.suggestions ? (
              <div key={key} className="my-12 animate-fade-in-scale">
                <DecisionPoint
                  prompt={part.prompt}
                  suggestions={part.suggestions}
                  onChoose={onDecision}
                />
              </div>
            ) : null;

          case "status":
            return (
              <div key={key} className="my-8 text-center animate-fade-in">
                <div className="inline-flex items-center gap-3 glass rounded-full px-6 py-3">
                  <svg className="animate-spin h-4 w-4 text-accent" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <p className="text-sm text-muted">{part.message}</p>
                </div>
              </div>
            );

          default:
            return null;
        }
      })}

      {isGenerating && (
        <div className="my-12 flex flex-col items-center gap-5 animate-fade-in">
          {/* Animated quill */}
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/30 flex items-center justify-center animate-pulse-glow">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent animate-float">
                <path d="M20.24 12.24a6 6 0 00-8.49-8.49L5 10.5V19h8.5z" />
                <path d="M16 8L2 22" />
                <path d="M17.5 15H9" />
              </svg>
            </div>
            {/* Orbiting dot */}
            <div className="absolute inset-0" style={{ animation: "rotate-slow 3s linear infinite" }}>
              <div className="w-2 h-2 rounded-full bg-accent absolute -top-1 left-1/2 -translate-x-1/2" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground mb-1">Forging your story...</p>
            <p className="text-xs text-muted">AI is crafting text and illustrations</p>
          </div>
        </div>
      )}

      <div ref={endRef} />
    </article>
  );
}

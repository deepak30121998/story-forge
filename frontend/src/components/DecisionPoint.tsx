"use client";
import { useState } from "react";

interface DecisionPointProps {
  prompt: string;
  suggestions: string[];
  onChoose: (choice: string) => void;
}

export function DecisionPoint({
  prompt,
  suggestions,
  onChoose,
}: DecisionPointProps) {
  const [chosen, setChosen] = useState<string | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleChoose = (choice: string) => {
    if (chosen) return;
    setChosen(choice);
    setTimeout(() => onChoose(choice), 600);
  };

  return (
    <div
      className="relative overflow-hidden rounded-3xl"
      role="group"
      aria-label="Story decision point"
    >
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5" />
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent/5 rounded-full blur-3xl" />

      <div className="relative glass rounded-3xl p-8 sm:p-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-primary/20 to-accent/20 text-accent text-xs font-bold rounded-full mb-4 uppercase tracking-widest border border-primary/20">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
            </svg>
            Your Choice
          </div>
          <p className="text-xl sm:text-2xl font-serif text-foreground animate-text-glow leading-relaxed">
            {prompt}
          </p>
        </div>

        {/* Choices */}
        <div className="space-y-3" role="list">
          {suggestions.map((suggestion, i) => {
            const isChosen = chosen === suggestion;
            const isDisabled = chosen !== null && !isChosen;
            const isHovered = hoveredIndex === i;

            return (
              <button
                key={`choice-${i}-${suggestion.slice(0, 20)}`}
                onClick={() => handleChoose(suggestion)}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                disabled={chosen !== null}
                role="listitem"
                aria-label={`Choice ${i + 1}: ${suggestion}`}
                aria-pressed={isChosen}
                className={`
                  w-full text-left rounded-2xl border-2 transition-all duration-500 relative overflow-hidden group
                  ${isChosen
                    ? "bg-gradient-to-r from-primary/20 to-accent/10 border-primary scale-[1.02] shadow-lg shadow-primary/20"
                    : isDisabled
                      ? "opacity-20 border-border bg-surface cursor-not-allowed scale-[0.98]"
                      : "border-border/50 bg-surface/50 hover:bg-surface-hover hover:border-accent/50 cursor-pointer hover:scale-[1.01]"
                  }
                `}
              >
                {/* Hover glow */}
                {!chosen && isHovered && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 transition-opacity" />
                )}

                <div className="relative flex items-start gap-4 px-6 py-5">
                  {/* Number badge */}
                  <div
                    className={`
                      w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 transition-all duration-500
                      ${isChosen
                        ? "bg-primary text-white shadow-lg shadow-primary/30"
                        : "bg-surface-hover text-muted group-hover:bg-primary/20 group-hover:text-accent"
                      }
                    `}
                  >
                    {isChosen ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>

                  <div className="flex-1 pt-1">
                    <span className={`text-sm sm:text-base leading-relaxed ${isChosen ? "text-foreground font-medium" : ""}`}>
                      {suggestion}
                    </span>
                  </div>

                  {/* Arrow */}
                  {!chosen && (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 mt-1.5 shrink-0"
                    >
                      <path d="M5 12h14m-7-7l7 7-7 7" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Chosen confirmation */}
        {chosen && (
          <div className="mt-6 text-center animate-fade-in">
            <p className="text-xs text-muted">The story continues...</p>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";
import { useState, useRef, useEffect } from "react";

interface AudioPlayerProps {
  src: string;
}

export function AudioPlayer({ src }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    audio.addEventListener("timeupdate", updateProgress);
    return () => audio.removeEventListener("timeupdate", updateProgress);
  }, []);

  const toggle = async () => {
    if (!audioRef.current || hasError) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch {
        setHasError(true);
        setIsPlaying(false);
      }
    }
  };

  if (hasError) {
    return (
      <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 opacity-40">
        <span className="text-xs text-muted">Narration unavailable</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-3 glass rounded-full px-4 py-2.5 group hover:border-accent/30 transition-all duration-300">
      <button
        onClick={toggle}
        aria-label={isPlaying ? "Pause narration" : "Play narration"}
        className="relative w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:scale-110"
      >
        {isPlaying ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" className="text-white">
            <rect x="1.5" y="1" width="3" height="10" rx="1" />
            <rect x="7.5" y="1" width="3" height="10" rx="1" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" className="text-white ml-0.5">
            <polygon points="2,0 12,6 2,12" />
          </svg>
        )}
      </button>

      <div className="flex flex-col gap-1">
        <span className="text-[11px] text-muted group-hover:text-foreground transition-colors">
          {isPlaying ? "Playing narration" : "Listen to narration"}
        </span>
        {/* Progress bar */}
        <div className="w-24 h-1 rounded-full bg-border overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Waveform animation when playing */}
      {isPlaying && (
        <div className="flex items-end gap-0.5 h-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-0.5 bg-accent rounded-full animate-bounce"
              style={{
                height: `${Math.random() * 12 + 4}px`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: "0.6s",
              }}
            />
          ))}
        </div>
      )}

      <audio
        ref={audioRef}
        src={src}
        onEnded={() => { setIsPlaying(false); setProgress(0); }}
        onError={() => setHasError(true)}
        preload="none"
      />
    </div>
  );
}

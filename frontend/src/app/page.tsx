"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Story } from "@/types/story";
import { listStories, deleteStory } from "@/lib/api";
import { ParticleField } from "@/components/ParticleField";

const GENRE_ICONS: Record<string, string> = {
  Fantasy: "\u2728", Sci_Fi: "\ud83d\ude80", Mystery: "\ud83d\udd0d", Romance: "\u2764\ufe0f",
  Horror: "\ud83d\udc7b", Adventure: "\u2694\ufe0f", Historical: "\ud83c\udff0", Mythology: "\u26a1",
};

export default function Home() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    listStories()
      .then(setStories)
      .catch(() => setStories([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDeletingId(id);
    try {
      await deleteStory(id);
      setStories((prev) => prev.filter((s) => s.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen relative">
      <ParticleField />

      {/* Hero */}
      <header className="relative overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
        <div className="absolute top-[-100px] right-[-100px] w-[300px] h-[300px] rounded-full bg-accent/5 blur-[80px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
          {/* Anvil icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/30 mb-8 animate-float">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent">
              <path d="M15 12l-2-2m0 0l-2 2m2-2v6m5-3a7 7 0 11-14 0 7 7 0 0114 0z" />
              <path d="M12 2L8 6h8l-4-4z" fill="currentColor" opacity="0.3" />
              <rect x="6" y="18" width="12" height="2" rx="1" fill="currentColor" opacity="0.2" />
            </svg>
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-5 animate-slide-up">
            <span className="bg-gradient-to-r from-accent via-primary to-purple-400 bg-clip-text text-transparent animate-gradient inline-block">
              Story Forge
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-muted max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            Craft immersive, interactive stories powered by AI — with generated
            prose, illustrations, and narration woven seamlessly together.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <Link
              href="/create"
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-accent rounded-2xl text-white font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/30 animate-pulse-glow"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-hover:rotate-90 duration-300">
                <path d="M12 5v14m-7-7h14" />
              </svg>
              Create a New Story
            </Link>

            <div className="flex items-center gap-2 text-muted text-sm">
              <div className="flex -space-x-1">
                {["#8b5cf6", "#c084fc", "#a78bfa"].map((c, i) => (
                  <div key={i} className="w-6 h-6 rounded-full border-2 border-background" style={{ background: c }} />
                ))}
              </div>
              <span>Text + Images + Audio</span>
            </div>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-12 animate-slide-up" style={{ animationDelay: "0.3s" }}>
            {[
              { label: "Interactive Choices", icon: "\ud83c\udfaf" },
              { label: "AI Illustrations", icon: "\ud83c\udfa8" },
              { label: "Voice Narration", icon: "\ud83c\udf99\ufe0f" },
              { label: "Gemini Powered", icon: "\u2728" },
            ].map((f) => (
              <div key={f.label} className="glass rounded-full px-4 py-2 text-xs text-muted flex items-center gap-2">
                <span>{f.icon}</span>
                {f.label}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Stories Gallery */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">
            Your Stories
          </h2>
          {stories.length > 0 && (
            <span className="text-xs text-muted glass rounded-full px-3 py-1">
              {stories.length} {stories.length === 1 ? "story" : "stories"}
            </span>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-56 rounded-2xl animate-shimmer" />
            ))}
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-surface border border-border mb-6">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted">
                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-xl font-semibold mb-2 text-foreground">No stories yet</p>
            <p className="text-muted mb-8 max-w-sm mx-auto">
              Your forged stories will appear here. Create your first one and watch AI bring it to life.
            </p>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-surface hover:bg-surface-hover border border-border hover:border-accent rounded-xl text-sm font-medium transition-all duration-300"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14m-7-7h14" />
              </svg>
              Create your first story
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {stories.map((story, i) => (
              <Link
                key={story.id}
                href={`/story/${story.id}`}
                className="story-card glass rounded-2xl p-6 block group animate-fade-in-scale"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                {/* Genre badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl">
                    {GENRE_ICONS[story.concept.genre.replace("-", "_")] || "\ud83d\udcda"}
                  </span>
                  <div className="flex gap-2">
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-primary/15 text-accent font-medium">
                      {story.concept.genre}
                    </span>
                  </div>
                </div>

                <h3 className="font-bold text-lg mb-2 group-hover:text-accent transition-colors duration-300 line-clamp-2">
                  {story.title}
                </h3>

                <div className="flex items-center gap-3 text-xs text-muted mb-4">
                  <span className="flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                    </svg>
                    {story.chapters?.length || 0} ch.
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-surface-hover">{story.concept.tone}</span>
                </div>

                {/* Characters preview */}
                <div className="flex items-center gap-1 mb-4">
                  {story.concept.characters.slice(0, 3).map((c, ci) => (
                    <div
                      key={ci}
                      className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/40 to-accent/20 border border-border flex items-center justify-center text-[10px] font-bold text-accent"
                    >
                      {c.name[0]?.toUpperCase()}
                    </div>
                  ))}
                  {story.concept.characters.length > 3 && (
                    <span className="text-[10px] text-muted ml-1">+{story.concept.characters.length - 3}</span>
                  )}
                </div>

                {/* Bottom bar */}
                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <span className="text-[10px] text-muted">
                    {story.createdAt ? new Date(story.createdAt).toLocaleDateString() : ""}
                  </span>
                  <button
                    onClick={(e) => handleDelete(e, story.id)}
                    disabled={deletingId === story.id}
                    className="text-[10px] text-muted hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10"
                    aria-label="Delete story"
                  >
                    {deletingId === story.id ? "..." : "Delete"}
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 text-xs text-muted border-t border-border/30">
        <p>Powered by Gemini &middot; Built with Google Cloud</p>
      </footer>
    </div>
  );
}

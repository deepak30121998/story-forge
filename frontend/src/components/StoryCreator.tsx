"use client";
import { useState } from "react";
import { Character } from "@/types/story";

const GENRES = [
  { name: "Fantasy", icon: "\u2728", desc: "Magic & mythical worlds" },
  { name: "Sci-Fi", icon: "\ud83d\ude80", desc: "Future & technology" },
  { name: "Mystery", icon: "\ud83d\udd0d", desc: "Clues & suspense" },
  { name: "Romance", icon: "\u2764\ufe0f", desc: "Love & passion" },
  { name: "Horror", icon: "\ud83d\udc7b", desc: "Fear & the unknown" },
  { name: "Adventure", icon: "\u2694\ufe0f", desc: "Quests & journeys" },
  { name: "Historical", icon: "\ud83c\udff0", desc: "Past eras & events" },
  { name: "Mythology", icon: "\u26a1", desc: "Gods & legends" },
];

const TONES = [
  { name: "Epic", icon: "\ud83d\udc51", desc: "Grand & sweeping" },
  { name: "Whimsical", icon: "\ud83c\udf1f", desc: "Playful & magical" },
  { name: "Dark", icon: "\ud83c\udf11", desc: "Gritty & intense" },
  { name: "Lighthearted", icon: "\u2600\ufe0f", desc: "Fun & uplifting" },
  { name: "Suspenseful", icon: "\ud83d\udca8", desc: "Tension & thrills" },
  { name: "Romantic", icon: "\ud83c\udf39", desc: "Tender & emotional" },
  { name: "Philosophical", icon: "\ud83e\udde0", desc: "Deep & thoughtful" },
  { name: "Humorous", icon: "\ud83d\ude04", desc: "Witty & funny" },
];

interface StoryCreatorProps {
  onSubmit: (concept: {
    genre: string;
    characters: Character[];
    setting: string;
    tone: string;
  }) => void;
  isLoading: boolean;
}

export function StoryCreator({ onSubmit, isLoading }: StoryCreatorProps) {
  const [step, setStep] = useState(0);
  const [genre, setGenre] = useState("");
  const [tone, setTone] = useState("");
  const [setting, setSetting] = useState("");
  const [characters, setCharacters] = useState<Character[]>([
    { name: "", role: "Protagonist", description: "" },
  ]);

  const addCharacter = () => {
    if (characters.length < 4) {
      setCharacters([...characters, { name: "", role: "", description: "" }]);
    }
  };

  const updateCharacter = (index: number, field: keyof Character, value: string) => {
    const updated = [...characters];
    updated[index] = { ...updated[index], [field]: value };
    setCharacters(updated);
  };

  const removeCharacter = (index: number) => {
    if (characters.length > 1) {
      setCharacters(characters.filter((_, i) => i !== index));
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0: return genre !== "";
      case 1: return characters[0].name && characters[0].description;
      case 2: return setting.trim().length > 10;
      case 3: return tone !== "";
      default: return false;
    }
  };

  const handleSubmit = () => {
    onSubmit({
      genre,
      characters: characters.filter((c) => c.name && c.description),
      setting,
      tone,
    });
  };

  const steps = [
    { label: "Genre", icon: "\ud83c\udfad" },
    { label: "Characters", icon: "\ud83d\udc64" },
    { label: "Setting", icon: "\ud83c\udf0d" },
    { label: "Tone", icon: "\ud83c\udfa8" },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="relative mb-12">
        <div className="flex items-center justify-between relative z-10">
          {steps.map((s, i) => (
            <button
              key={s.label}
              onClick={() => { if (i < step) setStep(i); }}
              className={`flex flex-col items-center gap-2 transition-all duration-300 ${i <= step ? "opacity-100" : "opacity-40"} ${i < step ? "cursor-pointer" : "cursor-default"}`}
            >
              <div
                className={`
                  w-12 h-12 rounded-2xl flex items-center justify-center text-lg transition-all duration-500
                  ${i < step ? "bg-primary/20 border-primary scale-100 shadow-lg shadow-primary/20" : ""}
                  ${i === step ? "bg-gradient-to-br from-primary to-accent text-white scale-110 shadow-lg shadow-primary/30" : ""}
                  ${i > step ? "bg-surface border-border" : ""}
                  border
                `}
              >
                {i < step ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-primary">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span>{s.icon}</span>
                )}
              </div>
              <span className={`text-xs font-medium ${i === step ? "text-accent" : "text-muted"}`}>
                {s.label}
              </span>
            </button>
          ))}
        </div>
        {/* Progress line */}
        <div className="absolute top-6 left-[12%] right-[12%] h-[2px] bg-border -z-0">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-700 ease-out rounded-full"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 0: Genre */}
      {step === 0 && (
        <div className="animate-fade-in-scale">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Choose Your Genre</h2>
            <p className="text-muted">What kind of story shall we forge?</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {GENRES.map((g) => (
              <button
                key={g.name}
                onClick={() => setGenre(g.name)}
                className={`genre-btn ${genre === g.name ? "active" : ""} flex flex-col items-center gap-2 px-4 py-5 rounded-2xl border text-center transition-all duration-300 hover:scale-[1.03] ${
                  genre === g.name
                    ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                    : "border-border bg-surface hover:border-accent/50 hover:bg-surface-hover"
                }`}
              >
                <span className="text-3xl mb-1">{g.icon}</span>
                <span className="text-sm font-semibold">{g.name}</span>
                <span className="text-[10px] text-muted leading-tight">{g.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 1: Characters */}
      {step === 1 && (
        <div className="animate-fade-in-scale">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Create Characters</h2>
            <p className="text-muted">Who will inhabit your story? (up to 4)</p>
          </div>
          <div className="space-y-4">
            {characters.map((char, i) => (
              <div
                key={i}
                className="glass rounded-2xl p-5 space-y-3 animate-fade-in-scale"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/40 to-accent/20 border border-primary/30 flex items-center justify-center text-lg font-bold text-accent shrink-0">
                    {char.name ? char.name[0].toUpperCase() : (i + 1)}
                  </div>
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      placeholder="Character name"
                      value={char.name}
                      onChange={(e) => updateCharacter(i, "name", e.target.value)}
                      className="flex-1 bg-background/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                    />
                    <input
                      type="text"
                      placeholder="Role"
                      value={char.role}
                      onChange={(e) => updateCharacter(i, "role", e.target.value)}
                      className="w-36 bg-background/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                    />
                  </div>
                  {characters.length > 1 && (
                    <button
                      onClick={() => removeCharacter(i)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-red-400 hover:bg-red-500/10 transition-all"
                      aria-label="Remove character"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                <textarea
                  placeholder="Brief description of this character..."
                  value={char.description}
                  onChange={(e) => updateCharacter(i, "description", e.target.value)}
                  rows={2}
                  className="w-full bg-background/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 resize-none transition-all"
                />
              </div>
            ))}
            {characters.length < 4 && (
              <button
                onClick={addCharacter}
                className="w-full py-4 border-2 border-dashed border-border rounded-2xl text-muted hover:border-accent hover:text-accent transition-all text-sm font-medium hover:bg-accent/5 flex items-center justify-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14m-7-7h14" />
                </svg>
                Add Character
              </button>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Setting */}
      {step === 2 && (
        <div className="animate-fade-in-scale">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Describe the Setting</h2>
            <p className="text-muted">Where and when does your story take place?</p>
          </div>
          <div className="glass rounded-2xl p-6">
            <textarea
              placeholder="A crumbling kingdom at the edge of a vast, enchanted forest where ancient magic still lingers in the mist..."
              value={setting}
              onChange={(e) => setSetting(e.target.value)}
              rows={6}
              className="w-full bg-transparent border-none text-foreground focus:outline-none resize-none font-serif text-lg leading-relaxed placeholder:text-muted/50"
            />
            <div className="flex items-center justify-between pt-4 border-t border-border/30 mt-2">
              <div className="flex gap-2">
                {[
                  "Ancient castle ruins",
                  "Neon-lit cyberpunk city",
                  "Underwater kingdom",
                ].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSetting(s)}
                    className="text-[10px] px-3 py-1.5 rounded-full bg-surface-hover text-muted hover:text-accent hover:border-accent border border-transparent transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <span className={`text-xs transition-colors ${setting.length >= 10 ? "text-primary" : "text-muted"}`}>
                {setting.length}/2000
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Tone */}
      {step === 3 && (
        <div className="animate-fade-in-scale">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Set the Tone</h2>
            <p className="text-muted">What mood should permeate your tale?</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {TONES.map((t) => (
              <button
                key={t.name}
                onClick={() => setTone(t.name)}
                className={`genre-btn ${tone === t.name ? "active" : ""} flex flex-col items-center gap-2 px-4 py-5 rounded-2xl border text-center transition-all duration-300 hover:scale-[1.03] ${
                  tone === t.name
                    ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                    : "border-border bg-surface hover:border-accent/50 hover:bg-surface-hover"
                }`}
              >
                <span className="text-3xl mb-1">{t.icon}</span>
                <span className="text-sm font-semibold">{t.name}</span>
                <span className="text-[10px] text-muted leading-tight">{t.desc}</span>
              </button>
            ))}
          </div>

          {/* Summary Preview */}
          {tone && (
            <div className="mt-8 glass rounded-2xl p-5 animate-fade-in-scale">
              <h3 className="text-xs font-semibold text-accent uppercase tracking-wider mb-3">Story Preview</h3>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="px-3 py-1.5 rounded-lg bg-primary/15 text-accent">{genre}</span>
                <span className="px-3 py-1.5 rounded-lg bg-surface-hover text-muted">{tone}</span>
                {characters.filter(c => c.name).map((c, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-lg bg-surface-hover text-muted">{c.name}</span>
                ))}
              </div>
              <p className="text-xs text-muted mt-3 line-clamp-2">{setting}</p>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center mt-10">
        <button
          onClick={() => setStep(step - 1)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm transition-all duration-300 ${
            step === 0
              ? "invisible"
              : "text-muted hover:text-foreground hover:bg-surface"
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5m7-7l-7 7 7 7" />
          </svg>
          Back
        </button>

        {step < 3 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-hover disabled:opacity-30 disabled:cursor-not-allowed rounded-xl text-sm font-medium text-white transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
          >
            Next
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14m-7-7l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!canProceed() || isLoading}
            className="group flex items-center gap-3 px-8 py-3.5 bg-gradient-to-r from-primary to-accent hover:shadow-xl hover:shadow-primary/30 disabled:opacity-30 disabled:cursor-not-allowed rounded-2xl text-sm font-bold text-white transition-all duration-300 hover:scale-105"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Forging...
              </>
            ) : (
              <>
                Forge Story
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-hover:translate-x-1">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

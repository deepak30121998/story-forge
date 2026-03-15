# Story Forge - AI-Powered Interactive Storyteller

An interactive storytelling **AI agent** powered by Google ADK (Agent Development Kit) that creates rich, multimodal narratives by seamlessly weaving together AI-generated prose, illustrations, and audio narration into a single, fluid story experience.

Built for the **Gemini Live Agent Challenge** — Creative Storyteller category.

## The Agent: Ignis, The Story Forge

Story Forge is not just a Gemini wrapper — it's a proper **AI agent** with a distinct persona called **Ignis**. Built on Google's ADK framework, Ignis has:

- **Persona** — An ancient, charismatic storyteller who adapts voice to genre (dark for horror, sweeping for fantasy, sharp for mystery)
- **Tools** — 5 specialized tools: illustration generation, voice narration, story memory, chapter saving, and memory recall
- **Memory** — Tracks character arcs, plot threads, foreshadowing seeds, and reader preferences across chapters
- **Decision Intelligence** — Creates meaningful branching choices where each option has genuine consequences

## What It Does

Users define a story concept (genre, characters, setting, tone) and the Ignis agent generates an immersive, interactive narrative:

- **Interleaved Text + Images** — Gemini generates prose and illustrations together using `responseModalities: ["TEXT", "IMAGE"]`, so visuals appear at natural story beats
- **Interactive Decision Points** — At the end of each chapter, readers choose from 3 meaningful options that shape the story
- **Audio Narration** — Text is narrated using Google Cloud Text-to-Speech Studio voices
- **Story Memory** — The agent remembers character arcs, plot threads, and reader preferences across chapters
- **Persistent Stories** — Saved to Firestore so users can return and continue

## Architecture

See `architecture-diagram.html` for the full interactive diagram, or view the text version:

```
┌─────────────────┐    REST / WebSocket    ┌────────────────────────┐
│    Next.js      │ ◄────────────────────► │  Express.js Backend    │
│    Frontend     │                        │  (Cloud Run)           │
│   (Cloud Run)   │                        │                        │
│                 │                        │  ┌──────────────────┐  │
│  Story Creator  │                        │  │  ADK Agent:      │  │
│  Story Reader   │                        │  │  Ignis           │  │
│  Decision UI    │                        │  │  (@google/adk)   │  │
│  Audio Player   │                        │  │                  │  │
│  Particle FX    │                        │  │  Tools:          │  │
└─────────────────┘                        │  │  - illustration  │  │
                                           │  │  - narration     │  │
                                           │  │  - memory        │  │
                                           │  │  - save_chapter  │  │
                                           │  └───────┬──────────┘  │
                                           └──────────┼─────────────┘
                                                      │
                    ┌─────────────┬───────────────┬────┴──────────┐
                    │             │               │               │
              ┌─────▼─────┐ ┌────▼────┐  ┌──────▼──────┐ ┌──────▼──────┐
              │  Gemini   │ │ Cloud   │  │  Firestore  │ │  Cloud TTS  │
              │  2.5 Flash│ │ Storage │  │  (Stories)  │ │ (Narration) │
              │  (GenAI)  │ │ (Media) │  │             │ │             │
              └───────────┘ └─────────┘  └─────────────┘ └─────────────┘
```

## Tech Stack

| Technology | Purpose |
|---|---|
| **Gemini 2.5 Flash** | Multimodal generation with interleaved text + image output |
| **Google ADK** (`@google/adk`) | Agent framework with tools, persona, and memory |
| **Google GenAI SDK** (`@google/genai`) | Node.js SDK for Gemini API calls |
| **Express.js + WebSockets** | Real-time streaming backend |
| **Next.js 16 + Tailwind CSS** | Frontend with particle effects, glassmorphism, animations |
| **Google Cloud Run** | Serverless hosting for both services |
| **Google Cloud Storage** | Persistent storage for generated images and audio |
| **Google Cloud Firestore** | NoSQL database for story persistence |
| **Google Cloud Text-to-Speech** | Studio voice narration |

## Quick Start

### Prerequisites

- Node.js 20+
- Gemini API key ([Get one free](https://aistudio.google.com/apikey))
- (Optional) Google Cloud project for Firestore/GCS/TTS

### Local Development

**Backend:**
```bash
cd backend
npm install
cp .env.example .env  # Add your GOOGLE_API_KEY
npm run dev
# Server runs at http://localhost:8080
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
# App runs at http://localhost:3000
```

> Note: Without a Google Cloud project, the backend uses in-memory storage and local file storage. Fully functional for development.

### Deploy to Google Cloud

```bash
export GOOGLE_CLOUD_PROJECT=your-project-id
export GOOGLE_API_KEY=your-gemini-key
./infra/deploy.sh
```

This script automatically:
1. Enables all required GCP APIs
2. Creates a Cloud Storage bucket
3. Deploys backend and frontend to Cloud Run
4. Outputs the live URLs

## Google Cloud Services Used

| Service | Purpose |
|---------|---------|
| Cloud Run | Hosts backend API and frontend (with session affinity for WebSocket) |
| Cloud Storage | Stores AI-generated images and audio narration files |
| Firestore | Persists story data, chapters, decisions, and summaries |
| Cloud Text-to-Speech | Generates Studio voice narration (en-US-Studio-O) |

## Agent Tools

| Tool | Description |
|------|-------------|
| `generate_illustration` | Creates AI illustrations at cinematic story moments using Gemini's native image generation |
| `generate_narration` | Produces voice narration via Cloud TTS with Studio voices |
| `store_memory` | Saves character arcs, plot threads, foreshadowing, and reader preferences |
| `recall_memory` | Retrieves story context before generating new chapters for continuity |
| `save_chapter` | Persists completed chapters with summaries to Firestore |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/api/agent/info` | Agent configuration and capabilities (for judges) |
| `GET` | `/api/agent/persona` | Ignis persona details |
| `POST` | `/api/stories` | Create a new story |
| `GET` | `/api/stories` | List all stories |
| `GET` | `/api/stories/:id` | Get a story with chapters |
| `DELETE` | `/api/stories/:id` | Delete a story |
| `WS` | `/ws` | WebSocket for real-time story streaming |

## Project Structure

```
story-forge/
├── backend/
│   ├── src/
│   │   ├── index.js              # Express + WebSocket server
│   │   ├── config.js             # Environment configuration
│   │   ├── agent/
│   │   │   ├── storyteller-agent.js  # ADK LlmAgent with persona
│   │   │   └── tools/
│   │   │       ├── illustration.js   # Image generation tool
│   │   │       ├── narration.js      # TTS narration tool
│   │   │       ├── memory.js         # Story memory tools
│   │   │       └── save-chapter.js   # Chapter persistence tool
│   │   ├── routers/
│   │   │   ├── stories.js        # REST API endpoints
│   │   │   ├── agent.js          # Agent info endpoints
│   │   │   └── ws.js             # WebSocket handler
│   │   ├── services/
│   │   │   ├── gemini.js         # Gemini interleaved generation
│   │   │   ├── storage.js        # Cloud Storage / local storage
│   │   │   ├── firestore.js      # Firestore / in-memory fallback
│   │   │   └── tts.js            # Text-to-Speech narration
│   │   └── prompts/
│   │       └── storyteller.js    # Prompt templates
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/                  # Next.js pages (home, create, story reader)
│   │   ├── components/
│   │   │   ├── StoryCreator.tsx  # 4-step story wizard
│   │   │   ├── StoryReader.tsx   # Interleaved content renderer
│   │   │   ├── DecisionPoint.tsx # Interactive choice UI
│   │   │   ├── AudioPlayer.tsx   # Narration player with waveform
│   │   │   ├── ParticleField.tsx # Animated background particles
│   │   │   └── ErrorBoundary.tsx # Crash recovery
│   │   ├── hooks/
│   │   │   └── useStoryStream.ts # WebSocket streaming hook
│   │   └── lib/
│   │       └── api.ts            # REST API client
│   └── Dockerfile
├── infra/
│   └── deploy.sh                 # Automated Cloud Run deployment
├── architecture-diagram.html     # Interactive architecture diagram
└── README.md
```

## Findings & Learnings

- **Gemini's interleaved output** is the killer feature — generating text and images in a single call creates a much more cohesive narrative than generating them separately
- **ADK's tool system** makes agent behavior predictable and debuggable compared to raw prompt engineering
- **Story memory** dramatically improves continuity — without it, chapter 3+ stories lose coherence
- **WebSocket streaming** is essential for UX — waiting 15-30s for a full chapter feels broken, but streaming text/images progressively feels engaging
- **Cloud Run session affinity** is required for WebSocket support — without it, connections get load-balanced to different instances

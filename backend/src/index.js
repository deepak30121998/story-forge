import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";
import http from "http";
import path from "path";
import { config } from "./config.js";
import storiesRouter from "./routers/stories.js";
import agentRouter from "./routers/agent.js";
import { setupWebSocket } from "./routers/ws.js";
import { ensureBucket } from "./services/storage.js";

const app = express();
const server = http.createServer(app);

// Middleware
app.use(
  cors({
    origin: config.allowedOrigins,
    methods: ["GET", "POST", "DELETE"],
  })
);
app.use(express.json({ limit: "1mb" }));

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "story-forge-api" });
});

// Serve local media files (dev mode)
app.use("/media", express.static(path.join(process.cwd(), "media")));

// REST routes
app.use("/api/stories", storiesRouter);
app.use("/api/agent", agentRouter);

// WebSocket
const wss = new WebSocketServer({ server, path: "/ws" });
setupWebSocket(wss);

// Global error handler
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Catch unhandled rejections
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});

// Start
async function start() {
  await ensureBucket();

  server.listen(config.port, () => {
    console.log(`Story Forge API running on port ${config.port}`);
    console.log(`WebSocket available at ws://localhost:${config.port}/ws`);
  });
}

start().catch(console.error);

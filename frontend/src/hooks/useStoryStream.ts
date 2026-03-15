"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { StoryPart, StoryConcept } from "@/types/story";
import { getWebSocketURL } from "@/lib/api";

type StreamStatus = "idle" | "connecting" | "generating" | "waiting" | "error";

export function useStoryStream() {
  const [parts, setParts] = useState<StoryPart[]>([]);
  const [status, setStatus] = useState<StreamStatus>("idle");
  const [currentChapter, setCurrentChapter] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const mountedRef = useRef(true);

  // Track mount state for cleanup
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // Cleanup WebSocket on unmount
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  const connect = useCallback(() => {
    return new Promise<WebSocket>((resolve, reject) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        resolve(wsRef.current);
        return;
      }

      // Close stale connection if exists
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      const ws = new WebSocket(getWebSocketURL());
      wsRef.current = ws;

      ws.onopen = () => {
        if (mountedRef.current) setStatus("idle");
        resolve(ws);
      };

      ws.onerror = () => {
        if (mountedRef.current) setStatus("error");
        reject(new Error("WebSocket connection failed"));
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;

        let msg: {
          type: string;
          content?: string;
          url?: string;
          prompt?: string;
          suggestions?: string[];
          message?: string;
          chapter?: number;
        };

        try {
          msg = JSON.parse(event.data);
        } catch {
          console.error("Invalid JSON from server:", event.data);
          return;
        }

        switch (msg.type) {
          case "text":
          case "image":
          case "audio":
          case "decision":
            setParts((prev) => [...prev, msg as StoryPart]);
            if (msg.type === "decision") {
              setStatus("waiting");
            }
            break;
          case "status":
            setParts((prev) => [
              ...prev,
              { type: "status", message: msg.message },
            ]);
            setStatus("generating");
            break;
          case "chapter_end":
            setCurrentChapter(msg.chapter || 0);
            break;
          case "error":
            setStatus("error");
            setParts((prev) => [
              ...prev,
              { type: "status", message: `Error: ${msg.message}` },
            ]);
            break;
        }
      };

      ws.onclose = () => {
        if (mountedRef.current) setStatus("idle");
        wsRef.current = null;
      };
    });
  }, []);

  const startStory = useCallback(
    async (storyId: string, concept: StoryConcept) => {
      setParts([]);
      setCurrentChapter(0);
      setStatus("connecting");
      try {
        const ws = await connect();
        setStatus("generating");
        ws.send(JSON.stringify({ type: "start", storyId, concept }));
      } catch {
        setStatus("error");
        setParts([{ type: "status", message: "Failed to connect to server" }]);
      }
    },
    [connect]
  );

  const continueStory = useCallback(
    async (storyId: string, decision: string) => {
      setStatus("generating");
      try {
        const ws = wsRef.current;
        if (!ws || ws.readyState !== WebSocket.OPEN) {
          const newWs = await connect();
          newWs.send(
            JSON.stringify({ type: "continue", storyId, decision })
          );
        } else {
          ws.send(JSON.stringify({ type: "continue", storyId, decision }));
        }
      } catch {
        setStatus("error");
        setParts((prev) => [
          ...prev,
          { type: "status", message: "Connection lost. Please refresh." },
        ]);
      }
    },
    [connect]
  );

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  return {
    parts,
    status,
    currentChapter,
    startStory,
    continueStory,
    disconnect,
  };
}

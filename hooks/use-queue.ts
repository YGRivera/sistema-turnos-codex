"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { EMPTY_STATE, isQueueState, QueueState, STORAGE_KEY } from "../lib/queue";

type QueueResponse = { version: number; state: QueueState; issuedNumber?: number; error?: string };

export function useQueue() {
  const [queue, setQueue] = useState<QueueState>(EMPTY_STATE);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const versionRef = useRef(-1);

  const sync = useCallback(async () => {
    try {
      const response = await fetch("/api/queue", { cache: "no-store" });
      let result = await response.json() as QueueResponse;
      if (!response.ok) throw new Error(result.error ?? "No se pudo cargar la fila.");
      // Import existing browser-only data once, but let empty devices wait for it.
      if (result.version === 0) {
        const legacy = localStorage.getItem(STORAGE_KEY);
        if (legacy) {
          try {
            const state: unknown = JSON.parse(legacy);
            if (isQueueState(state)) {
              const migrated = await fetch("/api/queue", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "migrate", state }),
              });
              if (migrated.ok) result = await migrated.json() as QueueResponse;
            }
          } catch {
            // Keep serving the shared server state if old browser data is invalid.
          }
        }
      }
      if (result.version >= versionRef.current) {
        versionRef.current = result.version;
        setQueue(result.state);
      }
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo conectar con el servidor.");
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void sync();
    const timer = window.setInterval(() => void sync(), 2000);
    return () => window.clearInterval(timer);
  }, [sync]);

  const act = useCallback(async (action: "take" | "call", module?: number) => {
    const response = await fetch("/api/queue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, module }),
    });
    const result = await response.json() as QueueResponse;
    if (!response.ok) {
      const message = result.error ?? "No se pudo actualizar la fila.";
      setError(message);
      throw new Error(message);
    }
    versionRef.current = Math.max(versionRef.current, result.version);
    setQueue(result.state);
    setError(null);
    return result;
  }, []);

  const takeTicket = useCallback(async () => {
    const result = await act("take");
    return result.issuedNumber!;
  }, [act]);

  const callNext = useCallback(async (module: number) => {
    await act("call", module);
  }, [act]);

  return { queue, ready, error, takeTicket, callNext };
}

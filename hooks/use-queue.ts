"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { EMPTY_STATE, QueueState, STORAGE_KEY } from "../lib/queue";

export function useQueue() {
  const [queue, setQueue] = useState<QueueState>(EMPTY_STATE);
  const [ready, setReady] = useState(false);
  const queueRef = useRef(EMPTY_STATE);
  const refresh = useCallback(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const next = saved ? { ...EMPTY_STATE, ...JSON.parse(saved) as Partial<QueueState> } : EMPTY_STATE;
      queueRef.current = next;
      setQueue(next);
    } catch { queueRef.current = EMPTY_STATE; setQueue(EMPTY_STATE); }
  }, []);
  useEffect(() => {
    refresh(); setReady(true);
    const onStorage = (event: StorageEvent) => { if (event.key === STORAGE_KEY) refresh(); };
    window.addEventListener("storage", onStorage);
    const channel = new BroadcastChannel("turnia.queue");
    channel.onmessage = refresh;
    return () => { window.removeEventListener("storage", onStorage); channel.close(); };
  }, [refresh]);
  const update = useCallback((mutate: (state: QueueState) => QueueState) => {
    const next = mutate(queueRef.current);
    queueRef.current = next;
    setQueue(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    const channel = new BroadcastChannel("turnia.queue");
    channel.postMessage("update");
    channel.close();
  }, []);
  const takeTicket = useCallback(() => {
    const issued = queueRef.current.nextNumber;
    update(state => ({ ...state, nextNumber: issued + 1, waiting: [...state.waiting, issued] }));
    return issued;
  }, [update]);
  const callNext = useCallback((module: number) => update(state => {
    const [number, ...waiting] = state.waiting;
    if (number === undefined) return state;
    const current = { number, module, calledAt: new Date().toISOString() };
    return { ...state, waiting, current, recent: [current, ...state.recent].slice(0, 4) };
  }), [update]);
  return { queue, ready, takeTicket, callNext };
}

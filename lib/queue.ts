export type QueueTicket = { number: number; module: number; calledAt: string };
export type QueueState = { nextNumber: number; waiting: number[]; current: QueueTicket | null; recent: QueueTicket[]; moduleCount: number };
export const STORAGE_KEY = "turnia.queue.v1";
export const EMPTY_STATE: QueueState = { nextNumber: 1, waiting: [], current: null, recent: [], moduleCount: 4 };
export function formatTicket(number: number) { return `A-${String(number).padStart(3, "0")}`; }

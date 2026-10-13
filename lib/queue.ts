export type QueueTicket = { number: number; module: number; calledAt: string; completedAt?: string };
export type QueueState = { nextNumber: number; waiting: number[]; current: QueueTicket | null; serving?: QueueTicket[]; recent: QueueTicket[]; moduleCount: number };
export const STORAGE_KEY = "turnia.queue.v1";
export const EMPTY_STATE: QueueState = { nextNumber: 1, waiting: [], current: null, serving: [], recent: [], moduleCount: 4 };
export function isQueueState(value: unknown): value is QueueState {
  if (!value || typeof value !== "object") return false;
  const state = value as Partial<QueueState>;
  const validTicket = (ticket: unknown): ticket is QueueTicket => {
    if (!ticket || typeof ticket !== "object") return false;
    const item = ticket as Partial<QueueTicket>;
    return Number.isInteger(item.number) && Number(item.number) > 0
      && Number.isInteger(item.module) && Number(item.module) >= 1 && Number(item.module) <= 4
      && typeof item.calledAt === "string"
      && (item.completedAt === undefined || typeof item.completedAt === "string");
  };
  return Number.isInteger(state.nextNumber) && Number(state.nextNumber) > 0
    && Array.isArray(state.waiting) && state.waiting.every(n => Number.isInteger(n) && n > 0)
    && (state.current === null || validTicket(state.current))
    && (state.serving === undefined || (Array.isArray(state.serving) && state.serving.every(validTicket)))
    && Array.isArray(state.recent) && state.recent.length <= 4 && state.recent.every(validTicket)
    && state.moduleCount === 4;
}
export function getServing(state: QueueState): QueueTicket[] {
  return state.serving ?? (state.current ? [state.current] : []);
}
export function formatTicket(number: number) { return `A-${String(number).padStart(3, "0")}`; }

import { NextResponse } from "next/server";
import { isQueueState } from "../../../lib/queue";
import { importLegacyQueue, mutateQueue, readQueue } from "../../../lib/queue-store";

export const dynamic = "force-dynamic";

class QueueActionError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

function unavailable(error: unknown) {
  console.error("Queue storage request failed", error);
  return NextResponse.json(
    { error: "No se pudo conectar con el almacenamiento compartido. Verifica DATABASE_URL." },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}

export async function GET() {
  try {
    return NextResponse.json(await readQueue(), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return unavailable(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { action?: string; module?: number; state?: unknown };
    if (body.action === "migrate") {
      if (!isQueueState(body.state)) {
        return NextResponse.json({ error: "El estado anterior no tiene un formato válido." }, { status: 400 });
      }
      return NextResponse.json(await importLegacyQueue(body.state), { headers: { "Cache-Control": "no-store" } });
    }
    if (body.action !== "take" && body.action !== "call" && body.action !== "finish") {
      return NextResponse.json({ error: "Acción no válida." }, { status: 400 });
    }
    if ((body.action === "call" || body.action === "finish") && (!Number.isInteger(body.module) || Number(body.module) < 1 || Number(body.module) > 4)) {
      return NextResponse.json({ error: "Módulo no válido." }, { status: 400 });
    }

    let issuedNumber: number | undefined;
    let actionError: QueueActionError | undefined;
    const result = await mutateQueue((state) => {
      const serving = state.serving ?? (state.current ? [state.current] : []);
      if (body.action === "take") {
        issuedNumber = state.nextNumber;
        return { ...state, nextNumber: state.nextNumber + 1, waiting: [...state.waiting, state.nextNumber] };
      }
      if (body.action === "finish") {
        const module = Number(body.module);
        const active = serving.find(ticket => ticket.module === module);
        if (!active) {
          actionError = new QueueActionError(`La mesa ${module} no tiene una atención activa.`, 409);
          return state;
        }
        const completedAt = new Date().toISOString();
        const remaining = serving.filter(ticket => ticket.module !== module);
        const recent = state.recent.map(ticket => ticket.number === active.number ? { ...ticket, completedAt } : ticket);
        return { ...state, serving: remaining, current: remaining.at(-1) ?? null, recent };
      }
      const module = Number(body.module);
      if (serving.some(ticket => ticket.module === module)) {
        actionError = new QueueActionError(`La mesa ${module} ya tiene un turno en atención.`, 409);
        return state;
      }
      const [number, ...waiting] = state.waiting;
      if (number === undefined) return state;
      const current = { number, module, calledAt: new Date().toISOString() };
      return { ...state, waiting, current, serving: [...serving, current], recent: [current, ...state.recent].slice(0, 4) };
    });
    if (actionError) return NextResponse.json({ error: actionError.message }, { status: actionError.status, headers: { "Cache-Control": "no-store" } });
    return NextResponse.json({ ...result, issuedNumber }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof QueueActionError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: { "Cache-Control": "no-store" } });
    }
    return unavailable(error);
  }
}

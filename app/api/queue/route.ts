import { NextResponse } from "next/server";
import { mutateQueue, readQueue } from "../../../lib/queue-store";

export const dynamic = "force-dynamic";

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
    const body = await request.json() as { action?: string; module?: number };
    if (body.action !== "take" && body.action !== "call") {
      return NextResponse.json({ error: "Acción no válida." }, { status: 400 });
    }
    if (body.action === "call" && (!Number.isInteger(body.module) || Number(body.module) < 1 || Number(body.module) > 4)) {
      return NextResponse.json({ error: "Módulo no válido." }, { status: 400 });
    }

    let issuedNumber: number | undefined;
    const result = await mutateQueue((state) => {
      if (body.action === "take") {
        issuedNumber = state.nextNumber;
        return { ...state, nextNumber: state.nextNumber + 1, waiting: [...state.waiting, state.nextNumber] };
      }
      const [number, ...waiting] = state.waiting;
      if (number === undefined) return state;
      const current = { number, module: Number(body.module), calledAt: new Date().toISOString() };
      return { ...state, waiting, current, recent: [current, ...state.recent].slice(0, 4) };
    });
    return NextResponse.json({ ...result, issuedNumber }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return unavailable(error);
  }
}

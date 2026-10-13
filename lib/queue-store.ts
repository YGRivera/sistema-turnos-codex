import { neon } from "@neondatabase/serverless";
import { EMPTY_STATE, QueueState } from "./queue";

const ROW_ID = "main";

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured");
  return neon(url);
}

async function ensureStore(sql: ReturnType<typeof getSql>) {
  await sql`CREATE TABLE IF NOT EXISTS turnia_queue_state (
    id TEXT PRIMARY KEY,
    version INTEGER NOT NULL,
    state JSONB NOT NULL
  )`;
  await sql`INSERT INTO turnia_queue_state (id, version, state)
    VALUES (${ROW_ID}, 0, ${JSON.stringify(EMPTY_STATE)}::jsonb)
    ON CONFLICT (id) DO NOTHING`;
}

export async function readQueue() {
  const sql = getSql();
  await ensureStore(sql);
  const [row] = await sql`SELECT version, state FROM turnia_queue_state WHERE id = ${ROW_ID}`;
  return { version: Number(row.version), state: row.state as QueueState };
}

export async function importLegacyQueue(state: QueueState) {
  const sql = getSql();
  await ensureStore(sql);
  const imported = await sql`UPDATE turnia_queue_state
    SET version = version + 1, state = ${JSON.stringify(state)}::jsonb
    WHERE id = ${ROW_ID} AND version = 0
    RETURNING version, state`;
  if (imported.length) {
    return { version: Number(imported[0].version), state: imported[0].state as QueueState };
  }
  return readQueue();
}

export async function mutateQueue(mutate: (state: QueueState) => QueueState) {
  const sql = getSql();
  await ensureStore(sql);

  // Compare-and-swap keeps simultaneous calls from different devices from
  // issuing duplicate ticket numbers or overwriting each other's updates.
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const [row] = await sql`SELECT version, state FROM turnia_queue_state WHERE id = ${ROW_ID}`;
    const version = Number(row.version);
    const next = mutate(row.state as QueueState);
    const updated = await sql`UPDATE turnia_queue_state
      SET version = version + 1, state = ${JSON.stringify(next)}::jsonb
      WHERE id = ${ROW_ID} AND version = ${version}
      RETURNING version, state`;
    if (updated.length) {
      return { version: Number(updated[0].version), state: updated[0].state as QueueState };
    }
  }
  throw new Error("Queue changed too often; please retry the action.");
}

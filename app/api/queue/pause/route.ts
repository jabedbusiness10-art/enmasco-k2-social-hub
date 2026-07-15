import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { ensureQueueEngine } from "@/lib/queue/bootstrap";
import { getQueue, pauseQueue, resumeQueue, QUEUE_NAMES } from "@/lib/queue/queue";
import { REDIS_READY } from "@/lib/queue/connection";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function control(action: "pause" | "resume", req: NextRequest) {
  const perm = await requirePermission("SOCIAL_CONNECT", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });
  if (!REDIS_READY) return NextResponse.json({ error: "Queue engine offline (Redis not configured)" }, { status: 503 });

  await ensureQueueEngine();
  const { queue } = await req.json().catch(() => ({ queue: null }));
  const names = queue ? [queue] : Object.values(QUEUE_NAMES);
  const fn = action === "pause" ? pauseQueue : resumeQueue;
  for (const name of names) {
    try {
      await fn(name);
    } catch {
      /* skip */
    }
  }
  return NextResponse.json({ ok: true, action, queues: names });
}

export async function POST(req: NextRequest) {
  return control("pause", req);
}

export { POST as PUT };

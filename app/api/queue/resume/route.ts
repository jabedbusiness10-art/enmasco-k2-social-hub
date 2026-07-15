import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { ensureQueueEngine } from "@/lib/queue/bootstrap";
import { getQueue, resumeQueue, QUEUE_NAMES } from "@/lib/queue/queue";
import { REDIS_READY } from "@/lib/queue/connection";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * TASK-57 — Resume a paused queue. Admin-only.
 */
export async function POST(req: NextRequest) {
  const perm = await requirePermission("SOCIAL_CONNECT", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });
  if (!REDIS_READY) return NextResponse.json({ error: "Queue engine offline (Redis not configured)" }, { status: 503 });

  await ensureQueueEngine();
  const { queue } = await req.json().catch(() => ({ queue: null }));
  const names = queue ? [queue] : Object.values(QUEUE_NAMES);
  for (const name of names) {
    try {
      await resumeQueue(name);
    } catch {
      /* skip */
    }
  }
  return NextResponse.json({ ok: true, action: "resume", queues: names });
}

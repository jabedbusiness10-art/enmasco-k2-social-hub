import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { ensureQueueEngine } from "@/lib/queue/bootstrap";
import { getQueue, QUEUE_NAMES } from "@/lib/queue/queue";
import { REDIS_READY } from "@/lib/queue/connection";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * TASK-57 — Clean a queue (remove completed + failed jobs). Admin-only.
 * Mirrors BullMQ's clean() with grace periods. Never deletes the queue itself.
 */
export async function POST(req: NextRequest) {
  const perm = await requirePermission("SOCIAL_CONNECT", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });
  if (!REDIS_READY) return NextResponse.json({ error: "Queue engine offline (Redis not configured)" }, { status: 503 });

  await ensureQueueEngine();
  const { queue, status = "completed", grace = 5000 } = await req.json().catch(() => ({
    queue: null,
    status: "completed",
    grace: 5000,
  }));
  const names = queue ? [queue] : Object.values(QUEUE_NAMES);
  let removed = 0;
  for (const name of names) {
    try {
      const q = getQueue(name);
      const removedJobs = await q.clean(grace, status as any);
      removed += Array.isArray(removedJobs) ? removedJobs.length : 0;
    } catch {
      /* skip */
    }
  }
  return NextResponse.json({ ok: true, removed, status });
}

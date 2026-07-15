import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { ensureQueueEngine } from "@/lib/queue/bootstrap";
import { getQueue, QUEUE_NAMES } from "@/lib/queue/queue";
import { REDIS_READY } from "@/lib/queue/connection";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * TASK-57 — Retry failed jobs. Admin-only.
 * Retries all failed jobs in the given queue (or all queues) via BullMQ.
 */
export async function POST(req: NextRequest) {
  const perm = await requirePermission("SOCIAL_CONNECT", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });
  if (!REDIS_READY) return NextResponse.json({ error: "Queue engine offline (Redis not configured)" }, { status: 503 });

  await ensureQueueEngine();
  const { queue } = await req.json().catch(() => ({ queue: null }));
  const names = queue ? [queue] : Object.values(QUEUE_NAMES);
  let retried = 0;
  for (const name of names) {
    try {
      const q = getQueue(name);
      const failed = await q.getFailed();
      for (const job of failed) {
        await job.retry();
        retried++;
      }
    } catch {
      /* skip unavailable queue */
    }
  }
  return NextResponse.json({ ok: true, retried });
}

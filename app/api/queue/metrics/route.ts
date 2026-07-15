import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { ensureQueueEngine } from "@/lib/queue/bootstrap";
import { collectMetrics, snapshotMetrics } from "@/lib/queue/metrics";
import { getLiveEvents } from "@/lib/queue/queue";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * TASK-57 — Queue metrics endpoint.
 * Real BullMQ counts (waiting/active/completed/failed/delayed) + live events.
 * Returns available:false when Redis is not configured (no fake data).
 */
export async function GET(req: NextRequest) {
  const perm = await requirePermission("SOCIAL_CONNECT", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });

  await ensureQueueEngine();
  const metrics = await collectMetrics();
  if (!metrics) {
    return NextResponse.json({
      available: false,
      reason: "Redis not configured",
      queues: [],
      totals: { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 },
      events: [],
      generatedAt: new Date().toISOString(),
    });
  }
  return NextResponse.json({
    available: true,
    redis: metrics.redis,
    queues: metrics.queues,
    totals: metrics.totals,
    events: getLiveEvents(30),
    generatedAt: metrics.generatedAt,
  });
}

/** POST triggers a metrics snapshot persistence (for trend history). */
export async function POST(req: NextRequest) {
  const perm = await requirePermission("SOCIAL_CONNECT", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });
  await snapshotMetrics();
  return NextResponse.json({ ok: true });
}

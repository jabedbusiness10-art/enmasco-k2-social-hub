import { NextRequest, NextResponse } from "next/server";
import { ensureQueueEngine } from "@/lib/queue/bootstrap";
import { pingRedis, REDIS_READY } from "@/lib/queue/connection";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * TASK-57 — Queue health endpoint.
 * Reports Redis availability (real) + engine readiness. Never fabricates data:
 * when Redis is absent it returns available:false so the UI shows
 * "Queue engine offline (Redis not configured)" rather than fake metrics.
 */
export async function GET(req: NextRequest) {
  let connected = false;
  if (REDIS_READY) {
    try {
      connected = await pingRedis();
    } catch {
      connected = false;
    }
  }
  const engine = await ensureQueueEngine();
  return NextResponse.json({
    available: REDIS_READY && connected,
    configured: REDIS_READY,
    redisConnected: connected,
    engine: engine.ready ? "bullmq" : "db-fallback",
    reason: engine.reason,
    generatedAt: new Date().toISOString(),
  });
}

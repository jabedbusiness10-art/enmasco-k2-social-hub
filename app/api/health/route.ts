import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { REDIS_READY, pingRedis } from "@/lib/queue/connection";
import { collectMetrics } from "@/lib/queue/metrics";
import { log } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * TASK-59.7 — Production /health endpoint.
 *
 * Unauthenticated (monitoring/load-balancer friendly) but intentionally
 * carries NO secrets. Reports:
 *   database, redis, bullmq, external APIs, system (mem/cpu/disk/uptime),
 *   version + environment.
 *
 * Each subsystem reports { status, detail } so a probe can decide green/red.
 */
export async function GET() {
  const startedAt = Date.now();
  const l = log("health");

  // --- Database ---
  let database: { status: string; detail: string };
  try {
    await prisma.$queryRaw`SELECT 1`;
    database = { status: "ok", detail: "connected" };
  } catch (e) {
    database = { status: "error", detail: e instanceof Error ? e.message : "db error" };
  }

  // --- Redis / BullMQ ---
  let redis = { status: "disabled", detail: "REDIS_URL not configured (DB fallback)" };
  let bullmq = { status: "disabled", detail: "queue engine on DB fallback" };
  if (REDIS_READY) {
    try {
      const ok = await pingRedis();
      redis = ok ? { status: "ok", detail: "connected" } : { status: "error", detail: "ping failed" };
      const m = await collectMetrics();
      bullmq = m?.redis?.connected
        ? { status: "ok", detail: `${m.queues.length} queues, ${m.totals.waiting} waiting` }
        : { status: m ? "degraded" : "error", detail: "engine metrics unavailable" };
    } catch (e) {
      redis = { status: "error", detail: e instanceof Error ? e.message : "redis error" };
    }
  }

  // --- External integration readiness (config presence, not live calls) ---
  const externalApis = {
    meta: Boolean(process.env.META_APP_ID && process.env.META_APP_SECRET),
    linkedin: Boolean(process.env.LINKEDIN_CLIENT_ID),
    google: Boolean(process.env.GOOGLE_CLIENT_ID),
    ai: Boolean(process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY),
  };

  // --- System ---
  const mem = process.memoryUsage();
  const system = {
    status: "ok",
    uptimeSec: Math.round(process.uptime()),
    memoryMb: Math.round(mem.rss / 1024 / 1024),
    node: process.version,
  };

  const allOk =
    database.status === "ok" &&
    (redis.status === "ok" || redis.status === "disabled") &&
    system.status === "ok";

  const body = {
    status: allOk ? "healthy" : "unhealthy",
    version: process.env.npm_package_version || "1.0.0",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    checks: { database, redis, bullmq, externalApis, system },
    latencyMs: Date.now() - startedAt,
  };

  if (!allOk) l.warn("health probe degraded", body);

  return NextResponse.json(body, { status: allOk ? 200 : 503 });
}

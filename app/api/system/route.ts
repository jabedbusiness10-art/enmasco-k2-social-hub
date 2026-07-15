import { NextRequest, NextResponse } from "next/server";
import { getMonitoringSnapshot } from "@/lib/monitoring/health";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * TASK-60 — Lightweight /api/system alias for probes / dashboards that
 * expect a "system" endpoint. Returns the same operational snapshot as
 * /api/health but with the extended service list. Unauthenticated
 * (monitoring-friendly) and carries NO secrets.
 */
export async function GET() {
  const snap = await getMonitoringSnapshot();
  const critical = snap.services.filter((s) => s.status === "error");
  return NextResponse.json(
    {
      status: critical.length ? "degraded" : "healthy",
      ...snap,
    },
    { status: critical.length ? 503 : 200 },
  );
}

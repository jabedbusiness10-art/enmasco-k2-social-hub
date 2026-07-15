import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { getMonitoringSnapshot } from "@/lib/monitoring/health";
import { getExternalServices } from "@/lib/monitoring/services";
import { evaluateAlerts } from "@/lib/monitoring/alerts";
import { log } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * TASK-60 — Full monitoring snapshot (admin only).
 * Reuses the health aggregator, external-service probe and alert engine.
 * Never returns secrets — only operational booleans + counts.
 */
export async function GET(req: NextRequest) {
  const perm = await requirePermission("MANAGE_USERS", req);
  if (!perm.ok) {
    log("monitoring").warn("status denied", { ip: req.headers.get("x-forwarded-for") });
    return NextResponse.json({ error: perm.error ?? "Forbidden" }, { status: 401 });
  }
  const [snapshot, externals] = await Promise.all([
    getMonitoringSnapshot(),
    getExternalServices(),
  ]);
  const alerts = evaluateAlerts(snapshot, externals);
  log("monitoring").info("status served", { alerts: alerts.length });
  return NextResponse.json({ snapshot, externals, alerts, generatedAt: new Date().toISOString() });
}

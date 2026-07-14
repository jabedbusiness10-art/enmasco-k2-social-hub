// ===========================================================================
// TASK-51 — app/api/analytics/aggregate/route.ts
// Server-only endpoint that returns real aggregated analytics.
// Consumed by the dashboard via useAnalytics hook / server component.
// Never exposes credentials; returns only normalized, non-sensitive metrics.
// ===========================================================================

import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { aggregateAnalytics } from "@/lib/analytics/aggregator";
import type { AnalyticsQuery } from "@/lib/analytics/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = await requirePermission("VIEW_ANALYTICS", req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as Partial<AnalyticsQuery>;
  const query: AnalyticsQuery = {
    range: (body.range as AnalyticsQuery["range"]) ?? "30d",
    platforms: Array.isArray(body.platforms) ? (body.platforms as AnalyticsQuery["platforms"]) : [],
  };

  try {
    const data = await aggregateAnalytics(query);
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Aggregation failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const auth = await requirePermission("VIEW_ANALYTICS", req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });
  const data = await aggregateAnalytics({ range: "30d", platforms: [] });
  return NextResponse.json(data);
}

import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { getActivityFeed } from "@/lib/executive/activity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * TASK-58.5 — Global Enterprise Activity Feed API.
 * Returns REAL aggregated events from every module (no fake data).
 */
export async function GET(req: NextRequest) {
  const perm = await requirePermission("VIEW_ANALYTICS", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });

  const feed = await getActivityFeed(40);
  return NextResponse.json({ items: feed, generatedAt: new Date().toISOString() });
}

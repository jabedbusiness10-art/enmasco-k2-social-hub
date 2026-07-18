import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { getDashboardAnalytics } from "@/lib/dashboard/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** TASK-71 — Dashboard Analytics Gateway. Real post count; honest nulls when no live provider. */
export async function GET(req: NextRequest) {
  const perm = await requirePermission("VIEW_ANALYTICS", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });
  try {
    const data = await getDashboardAnalytics();
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: "Failed to load dashboard analytics", detail: e instanceof Error ? e.message : "unknown" }, { status: 500 });
  }
}

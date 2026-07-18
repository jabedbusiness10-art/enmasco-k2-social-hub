import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { getDashboardSystem } from "@/lib/dashboard/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** TASK-71 — Dashboard System Gateway. Real operational health snapshot. */
export async function GET(req: NextRequest) {
  const perm = await requirePermission("VIEW_SETTINGS", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });
  try {
    const data = await getDashboardSystem();
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: "Failed to load dashboard system", detail: e instanceof Error ? e.message : "unknown" }, { status: 500 });
  }
}

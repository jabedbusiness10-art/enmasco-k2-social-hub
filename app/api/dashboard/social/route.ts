import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { getDashboardSocial } from "@/lib/dashboard/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** TASK-71 — Dashboard Social Gateway. Real connected account status. */
export async function GET(req: NextRequest) {
  const perm = await requirePermission("VIEW_SOCIAL", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });
  try {
    const data = await getDashboardSocial();
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: "Failed to load dashboard social", detail: e instanceof Error ? e.message : "unknown" }, { status: 500 });
  }
}

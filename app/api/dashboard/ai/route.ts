import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { getDashboardAiStatus } from "@/lib/dashboard/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** TASK-72 — Dashboard AI Status Gateway. Real AIJob counts + queue state. */
export async function GET(req: NextRequest) {
  const perm = await requirePermission("VIEW_AI", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });
  try {
    const data = await getDashboardAiStatus();
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: "Failed to load AI status", detail: e instanceof Error ? e.message : "unknown" }, { status: 500 });
  }
}

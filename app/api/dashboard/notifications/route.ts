import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { getDashboardNotifications } from "@/lib/dashboard/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** TASK-71 — Dashboard Notifications Gateway. Real unread/alert counts. */
export async function GET(req: NextRequest) {
  const perm = await requirePermission("VIEW_NOTIFICATIONS", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });
  try {
    const data = await getDashboardNotifications();
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: "Failed to load dashboard notifications", detail: e instanceof Error ? e.message : "unknown" }, { status: 500 });
  }
}

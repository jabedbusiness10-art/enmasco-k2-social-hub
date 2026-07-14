// ===========================================================================
// TASK-53 — app/api/team/activity/route.ts
// Activity timeline for the current user's assignments.
// ===========================================================================

import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { listActivity } from "@/lib/team";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requirePermission("VIEW_TEAM", req);
  if (!auth.ok || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });
  const list = await listActivity(auth.user.id, 40);
  return NextResponse.json({ activity: list });
}

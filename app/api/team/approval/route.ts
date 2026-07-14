// ===========================================================================
// TASK-53 — app/api/team/approval/route.ts
// Approval workflow: submit + decide (manager approval required).
// ===========================================================================

import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { createApproval, decideApproval } from "@/lib/team";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = await requirePermission("VIEW_TEAM", req);
  if (!auth.ok || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  if (!body.title) return NextResponse.json({ error: "title required" }, { status: 400 });
  const a = await createApproval({
    title: body.title,
    description: body.description,
    assignmentId: body.assignmentId,
    requestedById: auth.user.id,
  });
  return NextResponse.json({ approval: a }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const auth = await requirePermission("MANAGE_TEAM", req);
  if (!auth.ok || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const a = await decideApproval(body.id, auth.user.id, Boolean(body.approve), body.note);
  return NextResponse.json({ approval: a });
}

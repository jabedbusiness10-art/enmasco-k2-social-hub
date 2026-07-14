// ===========================================================================
// TASK-53 — app/api/team/comments/route.ts
// Add comments to an assignment (supports @user mentions).
// ===========================================================================

import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { addComment } from "@/lib/team";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = await requirePermission("VIEW_TEAM", req);
  if (!auth.ok || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  if (!body.assignmentId || !body.content) {
    return NextResponse.json({ error: "assignmentId and content required" }, { status: 400 });
  }
  const c = await addComment(body.assignmentId, auth.user.id, body.content);
  return NextResponse.json({ comment: c }, { status: 201 });
}

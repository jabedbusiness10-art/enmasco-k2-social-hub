// ===========================================================================
// TASK-56 — app/api/media/tags/merge/route.ts
// Merge one tag into another (moves assets, deletes source).
// ===========================================================================

import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { mediaService } from "@/services/media/mediaService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = await requirePermission("MEDIA_UPLOAD", req);
  if (!auth.ok || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  if (!body.fromId || !body.toId) return NextResponse.json({ error: "fromId and toId required" }, { status: 400 });
  if (body.fromId === body.toId) return NextResponse.json({ error: "cannot merge into self" }, { status: 400 });
  const r = await mediaService.mergeTag(body.fromId, body.toId);
  return NextResponse.json(r);
}

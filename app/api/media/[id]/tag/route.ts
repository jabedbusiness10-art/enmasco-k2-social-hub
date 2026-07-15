// ===========================================================================
// TASK-56 — app/api/media/[id]/tag/route.ts
// POST (add tag by tagId), DELETE (remove tag)
// ===========================================================================

import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { mediaService } from "@/services/media/mediaService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const perm = await requirePermission("MEDIA_UPLOAD", req);
  if (!perm.ok || !perm.user) return NextResponse.json({ error: perm.error }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (!body.tagId) return NextResponse.json({ error: "tagId required" }, { status: 400 });
  const r = await mediaService.tagAsset(id, body.tagId);
  return NextResponse.json({ ok: true, tag: r });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const perm = await requirePermission("MEDIA_UPLOAD", req);
  if (!perm.ok || !perm.user) return NextResponse.json({ error: perm.error }, { status: 401 });
  const { id } = await params;
  const sp = req.nextUrl.searchParams;
  const tagId = sp.get("tagId") || (await req.json().catch(() => ({}))).tagId;
  if (!tagId) return NextResponse.json({ error: "tagId required" }, { status: 400 });
  await mediaService.untagAsset(id, tagId);
  return NextResponse.json({ ok: true });
}

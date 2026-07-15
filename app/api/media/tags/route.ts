// ===========================================================================
// TASK-56 — app/api/media/tags/route.ts
// GET (list), POST (create), PATCH (rename/color), DELETE
// POST /api/media/tags/merge  -> { fromId, toId }
// ===========================================================================

import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { mediaService } from "@/services/media/mediaService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requirePermission("VIEW_MEDIA", req);
  if (!auth.ok || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });
  const tags = await mediaService.listTags();
  return NextResponse.json({ tags });
}

export async function POST(req: NextRequest) {
  const auth = await requirePermission("MEDIA_UPLOAD", req);
  if (!auth.ok || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  if (!body.name) return NextResponse.json({ error: "name required" }, { status: 400 });
  const tag = await mediaService.createTag(body.name, body.color);
  return NextResponse.json({ tag }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const auth = await requirePermission("MEDIA_UPLOAD", req);
  if (!auth.ok || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const tag = await mediaService.patchTag(body.id, { name: body.name, color: body.color });
  return NextResponse.json({ tag });
}

export async function DELETE(req: NextRequest) {
  const auth = await requirePermission("MEDIA_UPLOAD", req);
  if (!auth.ok || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });
  const sp = req.nextUrl.searchParams;
  const id = sp.get("id") || (await req.json().catch(() => ({}))).id;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await mediaService.deleteTag(id);
  return NextResponse.json({ ok: true });
}

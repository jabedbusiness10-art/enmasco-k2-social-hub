// ===========================================================================
// TASK-56 — app/api/media/collections/[id]/assets/route.ts
// POST (add assets), DELETE (remove assets) for a collection
// ===========================================================================

import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { mediaService } from "@/services/media/mediaService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePermission("MEDIA_UPLOAD", req);
  if (!auth.ok || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const ids: string[] = Array.isArray(body.assetIds) ? body.assetIds : body.assetId ? [body.assetId] : [];
  if (!ids.length) return NextResponse.json({ error: "assetIds required" }, { status: 400 });
  for (const assetId of ids) await mediaService.addToCollection(id, assetId);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePermission("MEDIA_UPLOAD", req);
  if (!auth.ok || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const ids: string[] = Array.isArray(body.assetIds) ? body.assetIds : body.assetId ? [body.assetId] : [];
  if (!ids.length) return NextResponse.json({ error: "assetIds required" }, { status: 400 });
  for (const assetId of ids) await mediaService.removeFromCollection(id, assetId);
  return NextResponse.json({ ok: true });
}

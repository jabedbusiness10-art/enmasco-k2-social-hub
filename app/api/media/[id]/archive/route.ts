// ===========================================================================
// TASK-56 — app/api/media/[id]/archive/route.ts
// POST (archive), DELETE (restore)
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
  const r = await mediaService.archiveAsset(id, perm.user.id, body.reason);
  return NextResponse.json({ asset: r });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const perm = await requirePermission("MEDIA_UPLOAD", req);
  if (!perm.ok || !perm.user) return NextResponse.json({ error: perm.error }, { status: 401 });
  const { id } = await params;
  const r = await mediaService.restoreAsset(id);
  return NextResponse.json({ asset: r });
}

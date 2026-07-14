// ===========================================================================
// TASK-55 — app/api/media/favorites/route.ts
// ===========================================================================

import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { mediaService } from "@/services/media/mediaService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requirePermission("VIEW_MEDIA", req);
  if (!auth.ok || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });
  const favs = await mediaService.listFavorites(auth.user.id);
  return NextResponse.json({ favorites: favs });
}

export async function POST(req: NextRequest) {
  const auth = await requirePermission("MEDIA_UPLOAD", req);
  if (!auth.ok || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  if (!body.assetId) return NextResponse.json({ error: "assetId required" }, { status: 400 });
  const r = await mediaService.toggleFavorite(body.assetId, auth.user.id);
  return NextResponse.json(r);
}

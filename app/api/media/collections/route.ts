// ===========================================================================
// TASK-55 — app/api/media/collections/route.ts
// ===========================================================================

import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { mediaService } from "@/services/media/mediaService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requirePermission("VIEW_MEDIA", req);
  if (!auth.ok || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });
  const sp = req.nextUrl.searchParams;
  const parent = sp.get("parentId");
  const collections = await mediaService.listCollections(parent === null ? null : parent ?? undefined);
  return NextResponse.json({ collections });
}

export async function POST(req: NextRequest) {
  const auth = await requirePermission("MEDIA_UPLOAD", req);
  if (!auth.ok || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  if (!body.name) return NextResponse.json({ error: "name required" }, { status: 400 });
  const c = await mediaService.createCollection(body.name, auth.user.id, body.parentId ?? null, body.description);
  return NextResponse.json({ collection: c }, { status: 201 });
}

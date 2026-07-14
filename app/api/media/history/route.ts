// ===========================================================================
// TASK-55 — app/api/media/history/route.ts + relationships (per-asset)
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
  const assetId = sp.get("assetId");
  if (!assetId) return NextResponse.json({ error: "assetId required" }, { status: 400 });
  const [history, relationships] = await Promise.all([
    mediaService.history(assetId),
    mediaService.relationships(assetId),
  ]);
  return NextResponse.json({ history, relationships });
}

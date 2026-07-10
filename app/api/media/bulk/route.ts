import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { mediaService } from "@/services/media/mediaService";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const perm = await requirePermission("MEDIA_UPLOAD", req);
  if (!perm.ok || !perm.user) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const ids: string[] = Array.isArray(body.ids) ? body.ids : [];
  const action = body.action; // delete | archive | restore | move | tag | favorite
  if (!ids.length) return NextResponse.json({ error: "ids required" }, { status: 400 });

  const result = await mediaService.bulk(ids, action, body, { userId: perm.user.id, userName: perm.user.name });
  return NextResponse.json(result);
}

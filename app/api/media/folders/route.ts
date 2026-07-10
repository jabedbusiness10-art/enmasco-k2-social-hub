import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { folderService } from "@/services/media/folderService";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const perm = await requirePermission("VIEW_MEDIA", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });
  const folders = await folderService.list();
  return NextResponse.json({ folders });
}

export async function POST(req: NextRequest) {
  const perm = await requirePermission("MEDIA_UPLOAD", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  if (!body.name) return NextResponse.json({ error: "name required" }, { status: 400 });
  const folder = await folderService.create(body.name, body.icon ?? null, body.parentId ?? null);
  return NextResponse.json({ folder }, { status: 201 });
}

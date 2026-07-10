import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { mediaService } from "@/services/media/mediaService";

export const runtime = "nodejs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const perm = await requirePermission("MEDIA_UPLOAD", req);
  if (!perm.ok || !perm.user) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { originalName, category, tags, description, favorited, folderId, status } = body;

  const data: any = {};
  if (typeof originalName === "string") data.originalName = originalName;
  if (typeof category === "string") data.category = category;
  if (Array.isArray(tags)) data.tags = tags;
  if (typeof description === "string") data.description = description;
  if (typeof favorited === "boolean") data.favorited = favorited;
  if (folderId !== undefined) {
    data.folderId = folderId === "" || folderId === "root" ? null : folderId;
  }
  if (typeof status === "string") {
    data.status = status;
    if (status === "ARCHIVED") data.archivedAt = new Date();
    if (status === "ACTIVE") data.archivedAt = null;
  }

  const asset = await mediaService.patch(id, data, { userId: perm.user.id, userName: perm.user.name });
  if (!asset) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ asset });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const perm = await requirePermission("MEDIA_DELETE", req);
  if (!perm.ok || !perm.user) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const hard = req.nextUrl.searchParams.get("hard") === "1";
  const asset = await mediaService.get(id);
  if (!asset) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (hard) {
    await mediaService.remove(id);
    return NextResponse.json({ success: true, deleted: true });
  }
  // soft delete -> trash
  await mediaService.patch(id, { status: "TRASHED", deletedAt: new Date() }, { userId: perm.user.id, userName: perm.user.name });
  return NextResponse.json({ success: true });
}

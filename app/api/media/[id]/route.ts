import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import cloudinary, { isCloudinaryConfigured } from "@/lib/cloudinary";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const perm = await requirePermission("MEDIA_UPLOAD", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { originalName, category, tags } = body;

  const data: any = {};
  if (typeof originalName === "string") data.originalName = originalName;
  if (typeof category === "string") data.category = category;
  if (Array.isArray(tags)) data.tags = tags;

  const asset = await prisma.mediaAsset.update({ where: { id }, data });
  return NextResponse.json({ asset });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const perm = await requirePermission("MEDIA_DELETE", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!asset) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (isCloudinaryConfigured()) {
    try {
      const resourceType =
        asset.fileType === "VIDEO" ? "video" : asset.fileType === "DOCUMENT" ? "raw" : "image";
      await cloudinary.uploader.destroy(asset.cloudinaryId, { resource_type: resourceType as any });
    } catch {
      /* ignore cloud delete failure, still soft-delete locally */
    }
  }

  await prisma.mediaAsset.update({ where: { id }, data: { deletedAt: new Date() } });
  return NextResponse.json({ success: true });
}

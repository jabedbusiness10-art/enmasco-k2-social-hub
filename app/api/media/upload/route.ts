import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { uploadService } from "@/services/media/uploadService";
import { notifyMedia } from "@/lib/notifications";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const perm = await requirePermission("MEDIA_UPLOAD", req);
  if (!perm.ok || !perm.user) {
    return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const files = form.getAll("files") as File[];
  const folderId = (form.get("folderId") as string) || null;
  const tagsRaw = form.get("tags") as string | null;
  const tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [];

  if (!files.length) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  const created = [];
  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const asset = await uploadService.uploadFile({
      buffer: Buffer.from(bytes),
      originalName: file.name,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      userId: perm.user.id,
      userName: perm.user.name,
      folderId,
      tags,
    });
    created.push(asset);
    try {
      await notifyMedia({
        userId: perm.user!.id, type: "MEDIA", priority: "LOW",
        title: "Upload Complete", body: `${asset.originalName || asset.fileName} added to Media Library.`,
        entity: asset.id, entityType: "ASSET", senderName: perm.user!.name,
      });
    } catch {}
  }

  return NextResponse.json({ assets: created }, { status: 201 });
}

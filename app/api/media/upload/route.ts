import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { uploadAsset } from "@/lib/cloudinary";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

function classifyFile(mime: string): "IMAGE" | "VIDEO" | "DOCUMENT" | "LOGO" | "BRAND_ASSET" {
  if (mime.startsWith("image/")) return mime.includes("logo") ? "LOGO" : "IMAGE";
  if (mime.startsWith("video/")) return "VIDEO";
  return "DOCUMENT";
}

export async function POST(req: NextRequest) {
  const perm = await requirePermission("MEDIA_UPLOAD", req);
  if (!perm.ok || !perm.user) {
    return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const files = form.getAll("files") as File[];
  const category = (form.get("category") as string) || null;
  const tagsRaw = form.get("tags") as string | null;
  const tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [];

  if (!files.length) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  const created = [];

  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const { cloudinaryId, url, width, height } = await uploadAsset(
      buffer,
      file.name,
      file.type,
    );

    const fileType = classifyFile(file.type);

    const asset = await prisma.mediaAsset.create({
      data: {
        fileName: cloudinaryId.split("/").pop() ?? cloudinaryId,
        originalName: file.name,
        fileType,
        mimeType: file.type,
        fileSize: file.size,
        cloudinaryId,
        url,
        width,
        height,
        category,
        tags,
        uploadedBy: perm.user.name,
        uploadedById: perm.user.id,
      },
    });
    created.push(asset);
  }

  return NextResponse.json({ assets: created }, { status: 201 });
}

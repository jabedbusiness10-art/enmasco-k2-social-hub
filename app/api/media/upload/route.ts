import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import cloudinary, { isCloudinaryConfigured } from "@/lib/cloudinary";
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

  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      { error: "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env.local" },
      { status: 503 }
    );
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
    const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;

    const resourceType = file.type.startsWith("video/") ? "video" : file.type.startsWith("image/") ? "image" : "raw";

    const result: any = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        dataUri,
        {
          folder: "enmasco-media",
          resource_type: resourceType as any,
        },
        (err: any, res: any) => (err ? reject(err) : resolve(res))
      );
    });

    const fileType = classifyFile(file.type);
    const width = result.width ?? null;
    const height = result.height ?? null;

    const asset = await prisma.mediaAsset.create({
      data: {
        fileName: result.public_id.split("/").pop() ?? result.public_id,
        originalName: file.name,
        fileType,
        mimeType: file.type,
        fileSize: file.size,
        cloudinaryId: result.public_id,
        url: result.secure_url,
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

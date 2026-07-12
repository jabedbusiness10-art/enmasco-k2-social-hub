import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { writeFile, mkdir } from "fs/promises";
import { randomUUID } from "crypto";
import { resolve } from "path";
import { extname } from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Dev file upload -> local public/uploads/messenger. In prod swap for S3-compatible
// storage (same returned shape: { url, fileName, originalName, mimeType, fileSize, kind }).
const KIND_BY_MIME: Record<string, string> = {
  "image/": "IMAGE", "video/": "VIDEO", "audio/": "AUDIO",
  "application/pdf": "PDF", "application/msword": "WORD",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "WORD",
  "application/vnd.ms-excel": "EXCEL",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "EXCEL",
  "application/vnd.ms-powerpoint": "POWERPOINT",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "POWERPOINT",
  "application/zip": "ZIP",
};

function kindFor(mime: string): string {
  if (mime.startsWith("image/")) return "IMAGE";
  if (mime.startsWith("video/")) return "VIDEO";
  if (mime.startsWith("audio/")) return "AUDIO";
  const hit = Object.entries(KIND_BY_MIME).find(([k]) => k === mime);
  return (hit?.[1] as string) ?? "OTHER";
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });

  const form = await req.formData().catch(() => null);
  if (!form) return new Response(JSON.stringify({ error: "invalid form" }), { status: 400, headers: { "Content-Type": "application/json" } });

  const out: any[] = [];
  for (const [key, value] of form.entries()) {
    if (!(value instanceof File)) continue;
    const originalName = value.name || "file";
    const mime = value.type || "application/octet-stream";
    const ext = extname(originalName) || ".bin";
    const fileName = `${randomUUID()}${ext}`;
    const dir = resolve(process.cwd(), "public/uploads/messenger");
    await mkdir(dir, { recursive: true });
    const buf = Buffer.from(await value.arrayBuffer());
    await writeFile(resolve(dir, fileName), buf);
    out.push({
      kind: kindFor(mime),
      fileName,
      originalName,
      mimeType: mime,
      fileSize: buf.length,
      url: `/uploads/messenger/${fileName}`,
      thumbnailUrl: mime.startsWith("image/") ? `/uploads/messenger/${fileName}` : null,
    });
  }
  if (!out.length) return new Response(JSON.stringify({ error: "no files" }), { status: 400, headers: { "Content-Type": "application/json" } });
  return new Response(JSON.stringify({ attachments: out }), { status: 201, headers: { "Content-Type": "application/json" } });
}

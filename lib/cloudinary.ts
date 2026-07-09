import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const isCloudinaryConfigured = (): boolean =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );

export type UploadResult = {
  cloudinaryId: string;
  url: string;
  width: number | null;
  height: number | null;
};

// Uploads a file. Uses Cloudinary when configured; otherwise falls back to a
// local public/uploads directory so the Media Library still works without
// external credentials (dev/demo mode).
export async function uploadAsset(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
): Promise<UploadResult> {
  if (isCloudinaryConfigured()) {
    const dataUri = `data:${mimeType};base64,${buffer.toString("base64")}`;
    const resourceType = mimeType.startsWith("video/")
      ? "video"
      : mimeType.startsWith("image/")
        ? "image"
        : "raw";
    const result: any = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        dataUri,
        { folder: "enmasco-media", resource_type: resourceType as any },
        (err: any, res: any) => (err ? reject(err) : resolve(res)),
      );
    });
    return {
      cloudinaryId: result.public_id,
      url: result.secure_url,
      width: result.width ?? null,
      height: result.height ?? null,
    };
  }

  // --- Local fallback ---
  const fs = await import("fs/promises");
  const path = await import("path");
  const crypto = await import("crypto");
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  const ext = path.extname(fileName) || "";
  const base = path.basename(fileName, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
  const unique = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
  const savedName = `${base}-${unique}${ext}`;
  await fs.writeFile(path.join(uploadDir, savedName), buffer);
  return {
    cloudinaryId: `local/${savedName}`,
    url: `/uploads/${savedName}`,
    width: null,
    height: null,
  };
}

export default cloudinary;

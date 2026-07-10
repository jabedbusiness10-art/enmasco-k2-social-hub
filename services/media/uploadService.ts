import { prisma } from "@/lib/db";
import { storageService } from "./storageService";
import { detectFileType, extractMeta } from "./metadataService";

export interface UploadInput {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  size: number;
  userId: string;
  userName: string;
  folderId?: string | null;
  tags?: string[];
  description?: string;
}

export const uploadService = {
  async uploadFile(input: UploadInput) {
    const meta = extractMeta({ name: input.originalName, type: input.mimeType, size: input.size });
    const stored = await storageService.upload(input.buffer, input.originalName);
    const fileType = detectFileType(input.mimeType);

    const asset = await prisma.mediaAsset.create({
      data: {
        fileName: stored.key,
        originalName: input.originalName,
        fileType,
        mimeType: input.mimeType,
        fileSize: input.size,
        cloudinaryId: stored.key,
        url: stored.url,
        width: meta.width,
        height: meta.height,
        duration: meta.duration,
        extension: meta.extension,
        folderId: input.folderId ?? null,
        tags: input.tags ?? [],
        description: input.description ?? null,
        uploadedBy: input.userName,
        uploadedById: input.userId,
      },
    });

    await prisma.mediaActivity.create({
      data: { assetId: asset.id, userId: input.userId, userName: input.userName, action: "UPLOAD", meta: input.originalName },
    });

    return asset;
  },
};

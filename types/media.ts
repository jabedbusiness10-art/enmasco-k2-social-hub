export type MediaFileType = "IMAGE" | "VIDEO" | "DOCUMENT" | "LOGO" | "BRAND_ASSET";

export interface MediaAsset {
  id: string;
  fileName: string;
  originalName: string;
  fileType: MediaFileType;
  mimeType: string;
  fileSize: number;
  cloudinaryId: string;
  url: string;
  width: number | null;
  height: number | null;
  category: string | null;
  tags: string[];
  favorited: boolean;
  uploadedBy: string;
  uploadedById: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export const MEDIA_TYPE_LABELS: Record<MediaFileType, string> = {
  IMAGE: "Images",
  VIDEO: "Videos",
  DOCUMENT: "Documents",
  LOGO: "Logos",
  BRAND_ASSET: "Brand Assets",
};

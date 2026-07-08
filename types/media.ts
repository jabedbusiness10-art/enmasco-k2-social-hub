export type MediaType = "image" | "video" | "document";
export type MediaCategory = "ALL" | "IMAGES" | "VIDEOS" | "DOCUMENTS" | "BRAND" | "CAMPAIGN" | "AI_GENERATED" | "FAVORITES" | "RECENT" | "TRASH";

export interface MediaAsset {
  id: string;
  name: string;
  type: MediaType;
  size: string;
  category: MediaCategory;
  uploadedBy: string;
  uploadedAt: string;
  favorite: boolean;
  tags: string[];
  description?: string;
  resolution?: string;
  dimensions?: string;
  folder?: string;
  campaign?: string;
}

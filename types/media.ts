export type MediaFileType = "IMAGE" | "VIDEO" | "DOCUMENT" | "LOGO" | "BRAND_ASSET";

export type MediaStatusType = "ACTIVE" | "ARCHIVED" | "TRASHED";

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
  duration: number | null;
  extension: string | null;
  category: string | null;
  tags: string[];
  description: string | null;
  status: MediaStatusType;
  favorited: boolean;
  usageCount: number;
  lastUsedAt: string | null;
  uploadedBy: string;
  uploadedById: string | null;
  folderId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  archivedAt: string | null;
}

export interface MediaFolder {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  parentId: string | null;
  order: number;
  createdAt: string;
}

export interface MediaActivityItem {
  id: string;
  assetId: string;
  userId: string;
  userName: string;
  action: string;
  meta: string | null;
  createdAt: string;
}

export const MEDIA_TYPE_LABELS: Record<MediaFileType, string> = {
  IMAGE: "Images",
  VIDEO: "Videos",
  DOCUMENT: "Documents",
  LOGO: "Logos",
  BRAND_ASSET: "Brand Assets",
};

// Fixed system folders shown in the left sidebar (slug -> meta)
export const SYSTEM_FOLDERS: { slug: string; label: string; icon: string }[] = [
  { slug: "__favorites", label: "Favorites", icon: "Star" },
  { slug: "__recent", label: "Recent", icon: "Clock" },
  { slug: "images", label: "Images", icon: "Image" },
  { slug: "videos", label: "Videos", icon: "Video" },
  { slug: "documents", label: "Documents", icon: "FileText" },
  { slug: "brand-assets", label: "Brand Assets", icon: "Shield" },
  { slug: "marketing", label: "Marketing", icon: "Megaphone" },
  { slug: "campaigns", label: "Campaigns", icon: "Target" },
  { slug: "facebook", label: "Facebook", icon: "Facebook" },
  { slug: "instagram", label: "Instagram", icon: "Instagram" },
  { slug: "linkedin", label: "LinkedIn", icon: "Linkedin" },
  { slug: "youtube", label: "YouTube", icon: "Youtube" },
  { slug: "products", label: "Products", icon: "Package" },
  { slug: "projects", label: "Projects", icon: "FolderKanban" },
  { slug: "events", label: "Events", icon: "CalendarDays" },
  { slug: "archives", label: "Archives", icon: "Archive" },
  { slug: "__trash", label: "Trash", icon: "Trash2" },
];

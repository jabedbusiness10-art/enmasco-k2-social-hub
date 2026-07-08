import type { MediaAsset, MediaCategory } from "@/types/media";

export const mediaAssets: MediaAsset[] = [
  { id: "m1", name: "eid_promo_banner.png", type: "image", size: "2.4 MB", category: "CAMPAIGN", uploadedBy: "Jabed Hossain", uploadedAt: "2026-07-07", favorite: true, tags: ["EID", "PROMO"], resolution: "1920x1080", folder: "Campaigns/2026/July", campaign: "Eid eCommerce Blitz" },
  { id: "m2", name: "security_intro.mp4", type: "video", size: "48 MB", category: "BRAND", uploadedBy: "Sara Khan", uploadedAt: "2026-07-06", favorite: false, tags: ["SECURITY", "INTRO"], resolution: "4K", folder: "Brand Assets" },
  { id: "m3", name: "weekly_report.pdf", type: "document", size: "1.2 MB", category: "DOCUMENTS", uploadedBy: "MD Kazim", uploadedAt: "2026-07-08", favorite: false, tags: ["REPORT", "WEEKLY"] },
  { id: "m4", name: "linkedin_banner.jpg", type: "image", size: "1.1 MB", category: "BRAND", uploadedBy: "Jabed Hossain", uploadedAt: "2026-07-05", favorite: true, tags: ["LINKEDIN", "BANNER"], resolution: "1200x627", folder: "Brand Assets" },
  { id: "m5", name: "ai_generated_post_01.png", type: "image", size: "3.4 MB", category: "AI_GENERATED", uploadedBy: "K2Kai AI", uploadedAt: "2026-07-08", favorite: true, tags: ["AI", "SOCIAL"] },
  { id: "m6", name: "product_demo.mov", type: "video", size: "120 MB", category: "CAMPAIGN", uploadedBy: "Arif", uploadedAt: "2026-07-04", favorite: false, tags: ["DEMO", "PRODUCT"], resolution: "1080p" },
  { id: "m7", name: "ceo_brief.pdf", type: "document", size: "890 KB", category: "DOCUMENTS", uploadedBy: "Nusrat", uploadedAt: "2026-07-08", favorite: false, tags: ["CEO", "BRIEF"] },
];

export const mediaCategories: MediaCategory[] = ["ALL", "IMAGES", "VIDEOS", "DOCUMENTS", "BRAND", "CAMPAIGN", "AI_GENERATED", "FAVORITES", "RECENT", "TRASH"];

export const kpis = [
  { label: "Total Assets", value: "248" },
  { label: "Folders", value: "18" },
  { label: "Videos", value: "34" },
  { label: "Images", value: "182" },
  { label: "Documents", value: "26" },
  { label: "AI Generated", value: "6" },
  { label: "Favorites", value: "12" },
  { label: "Trash", value: "4" },
];

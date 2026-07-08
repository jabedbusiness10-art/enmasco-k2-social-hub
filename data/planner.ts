import type { Campaign, ScheduledPost } from "@/types/planner";

export const campaigns: Campaign[] = [
  { id: "c1", name: "Eid eCommerce Blitz", status: "ACTIVE", startDate: "2026-07-01", endDate: "2026-07-15" },
  { id: "c2", name: "Q3 Security Roundup", status: "DRAFT", startDate: "2026-07-10", endDate: "2026-07-30" },
  { id: "c3", name: "CCTV Landing Page Launch", status: "COMPLETED", startDate: "2026-06-20", endDate: "2026-07-05" },
];

export const scheduledPosts: ScheduledPost[] = [
  { id: "s1", platform: "FACEBOOK", title: "Eid promo post", scheduledAt: "2026-07-10T09:00", status: "SCHEDULED" },
  { id: "s2", platform: "INSTAGRAM", title: "Reels teaser", scheduledAt: "2026-07-10T11:30", status: "APPROVED" },
  { id: "s3", platform: "LINKEDIN", title: "Enterprise AI post", scheduledAt: "2026-07-11T08:00", status: "DRAFT" },
  { id: "s4", platform: "X", title: "CCTV announcement", scheduledAt: "2026-07-12T10:00", status: "PUBLISHED" },
  { id: "s5", platform: "YOUTUBE", title: "Installation demo", scheduledAt: "2026-07-12T14:00", status: "SCHEDULED" },
];

import type { ScheduledPost, PostStatus } from "@/types/scheduler";

export const posts: ScheduledPost[] = [
  { id: "s1", title: "Eid Promo Post", caption: "Get 50% off for Eid!", platform: "facebook", scheduledAt: "2026-07-10 09:00", status: "SCHEDULED", owner: "Jabed Hossain", campaign: "Eid eCommerce Blitz", tags: ["EID", "PROMO"], approvalRequired: true, approvalStatus: "APPROVED" },
  { id: "s2", title: "Security Tips Reel", caption: "5 tips to secure your home", platform: "instagram", scheduledAt: "2026-07-09 06:30", status: "APPROVED", owner: "Sara Khan", campaign: "Security Awareness", tags: ["SECURITY", "REEL"], approvalRequired: true, approvalStatus: "PENDING" },
  { id: "s3", title: "LinkedIn Job Post", caption: "We are hiring!", platform: "linkedin", scheduledAt: "2026-07-08 10:00", status: "PUBLISHED", owner: "MD Kazim", tags: ["HIRING"], approvalRequired: false },
  { id: "s4", title: "Product Launch", caption: "New product coming soon", platform: "facebook", scheduledAt: "2026-07-11 02:00", status: "DRAFT", owner: "Jabed Hossain", campaign: "Product Launch", tags: ["PRODUCT"], approvalRequired: true },
  { id: "s5", title: "Weekly Promo", caption: "Weekly deals inside", platform: "instagram", scheduledAt: "2026-07-12 07:00", status: "PENDING_APPROVAL", owner: "Arif", tags: ["PROMO", "WEEKLY"], approvalRequired: true, approvalStatus: "PENDING" },
  { id: "s6", title: "Company Update", caption: "Milestone achieved", platform: "linkedin", scheduledAt: "2026-07-08 09:15", status: "FAILED", owner: "Nusrat", tags: ["UPDATE"], approvalRequired: false },
];

export const statusCounts: Record<PostStatus, number> = {
  DRAFT: 1,
  PENDING_APPROVAL: 1,
  APPROVED: 1,
  SCHEDULED: 1,
  PUBLISHED: 1,
  FAILED: 1,
};

export const kpis = [
  { label: "Scheduled Posts", value: "1" },
  { label: "Draft Posts", value: "1" },
  { label: "Ready to Publish", value: "1" },
  { label: "Today's Queue", value: "0" },
  { label: "Published Today", value: "1" },
  { label: "Failed Posts", value: "1" },
];

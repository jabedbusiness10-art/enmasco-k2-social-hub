import type { PublishJob, PlatformStatusItem, PublishHistoryItem } from "@/types/publishing";

export const publishJobs: PublishJob[] = [
  { id: "p1", platform: "facebook", title: "Eid Promo Post", status: "QUEUED", scheduledAt: "2026-07-10 09:00", priority: "HIGH", content: "Get 50% off for Eid!" },
  { id: "p2", platform: "instagram", title: "Security Tips Reel", status: "PUBLISHING", scheduledAt: "2026-07-09 06:30", priority: "MEDIUM", content: "5 tips to secure your home" },
  { id: "p3", platform: "linkedin", title: "LinkedIn Job Post", status: "SUCCESS", scheduledAt: "2026-07-08 10:00", priority: "LOW", publishedAt: "2026-07-08 10:00" },
  { id: "p4", platform: "facebook", title: "Product Launch", status: "FAILED", scheduledAt: "2026-07-11 02:00", priority: "HIGH", error: "Token expired" },
  { id: "p5", platform: "instagram", title: "Weekly Promo", status: "RETRY", scheduledAt: "2026-07-12 07:00", priority: "MEDIUM", retryCount: 2 },
];

export const platformStatuses: PlatformStatusItem[] = [
  { platform: "facebook", connected: true, queueSize: 2, lastPublish: "2026-07-08 10:00", lastError: "Token refresh required" },
  { platform: "instagram", connected: true, queueSize: 1, lastPublish: "2026-07-08 09:15" },
  { platform: "linkedin", connected: true, queueSize: 0, lastPublish: "2026-07-07 14:30" },
  { platform: "website", connected: true, queueSize: 0, lastPublish: "2026-07-06 11:20" },
  { platform: "youtube", connected: false, queueSize: 0, lastPublish: "Never", lastError: "API not configured" },
];

export const publishHistory: PublishHistoryItem[] = [
  { id: "h1", platform: "linkedin", publishedAt: "2026-07-08 10:00", title: "LinkedIn Job Post", result: "SUCCESS", retryCount: 0 },
  { id: "h2", platform: "facebook", publishedAt: "2026-07-07 16:45", title: "Brand Awareness Post", result: "FAILED", retryCount: 1 },
];

export const kpis = [
  { label: "Ready to Publish", value: "1" },
  { label: "Publishing Now", value: "1" },
  { label: "Published Successfully", value: "1" },
  { label: "Failed Publications", value: "1" },
  { label: "Waiting Queue", value: "1" },
  { label: "Today's Published", value: "1" },
];

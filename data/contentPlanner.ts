import type {
  ContentPlan,
  Campaign,
  Department,
  Platform,
  PlatformKey,
  User,
  PlanningActivity,
  ContentStatus,
} from "@/types/contentPlanner";

// ---------------------------------------------------------------------------
// Static reference data
// ---------------------------------------------------------------------------

export const platforms: Platform[] = [
  { key: "facebook", name: "Facebook", color: "#1877F2", short: "f" },
  { key: "instagram", name: "Instagram", color: "#E4405F", short: "ig" },
  { key: "linkedin", name: "LinkedIn", color: "#0A66C2", short: "in" },
  { key: "x", name: "X", color: "#E7E9EA", short: "X" },
  { key: "youtube", name: "YouTube", color: "#FF0000", short: "▶" },
  { key: "tiktok", name: "TikTok", color: "#FE2C55", short: "♪" },
];

export const departments: Department[] = [
  { id: "d1", name: "Marketing" },
  { id: "d2", name: "Sales" },
  { id: "d3", name: "Brand" },
  { id: "d4", name: "Corporate Comms" },
];

export const campaigns: Campaign[] = [
  { id: "c1", name: "Eid eCommerce Blitz", color: "#f59e0b", status: "ACTIVE", startDate: "2026-07-01", endDate: "2026-07-20" },
  { id: "c2", name: "Security Awareness", color: "#22d3ee", status: "ACTIVE" },
  { id: "c3", name: "Product Launch Q3", color: "#a855f7", status: "PLANNED", startDate: "2026-07-15" },
  { id: "c4", name: "Hiring Drive", color: "#34d399", status: "ACTIVE" },
  { id: "c5", name: "Weekly Nurture", color: "#60a5fa", status: "ACTIVE" },
];

export const users: User[] = [
  { id: "u1", name: "Jabed Hossain", color: "#0ea5e9", role: "CEO" },
  { id: "u2", name: "Sara Khan", color: "#ec4899", role: "Content Lead" },
  { id: "u3", name: "MD Kazim", color: "#8b5cf6", role: "Sales Head" },
  { id: "u4", name: "Arif Rahman", color: "#f97316", role: "Designer" },
  { id: "u5", name: "Nusrat Jahan", color: "#14b8a6", role: "PR Manager" },
];

// ---------------------------------------------------------------------------
// Date helpers — anchored to "now" so the calendar is always populated.
// ---------------------------------------------------------------------------

function iso(daysFromNow: number, hour: number, min = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
}
function at(daysFromNow: number, hour: number, min = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
}

// ---------------------------------------------------------------------------
// Core content plans (mock)
// ---------------------------------------------------------------------------

export const contentPlans: ContentPlan[] = [
  {
    id: "cp1",
    title: "Eid Mega Sale Reveal",
    caption: "Celebrate Eid with up to 50% off across the store. Tap the link to shop the collection before it's gone.",
    platform: "facebook",
    status: "SCHEDULED",
    schedule: { scheduledAt: iso(0, 9, 0), timezone: "Asia/Dhaka", recurrence: "NONE" },
    approval: { status: "APPROVED", requestedAt: at(-2, 10), decidedAt: at(-1, 14), decidedBy: "Jabed Hossain" },
    campaignId: "c1",
    departmentId: "d1",
    creatorId: "u2",
    assigneeId: "u2",
    media: { id: "m1", type: "IMAGE", alt: "Eid sale banner" },
    hashtags: ["Eid2026", "MegaSale", "ENMASCO"],
    notes: "Boost with ₹5k budget. Coordinate with Sales for inventory.",
    createdAt: at(-3, 11),
    updatedAt: at(-1, 14),
  },
  {
    id: "cp2",
    title: "Security Tips Reel",
    caption: "5 quick tips to keep your home network secure this season. Save this for later! 🔐",
    platform: "instagram",
    status: "REVIEW",
    schedule: { scheduledAt: iso(1, 6, 30), timezone: "Asia/Dhaka", recurrence: "NONE" },
    approval: { status: "PENDING", requestedAt: at(0, 8) },
    campaignId: "c2",
    departmentId: "d3",
    creatorId: "u4",
    assigneeId: "u2",
    media: { id: "m2", type: "VIDEO", alt: "Security tips reel" },
    hashtags: ["CyberSecurity", "Tips", "ENMASCO"],
    createdAt: at(-1, 16),
    updatedAt: at(0, 8),
  },
  {
    id: "cp3",
    title: "We're Hiring — Engineering",
    caption: "Join our growing engineering team. Remote-friendly roles open across backend, frontend and DevOps.",
    platform: "linkedin",
    status: "PUBLISHED",
    schedule: { scheduledAt: iso(-2, 10, 0), timezone: "Asia/Dhaka", recurrence: "NONE", publishedAt: at(-2, 10, 0) },
    approval: { status: "NOT_REQUIRED" },
    campaignId: "c4",
    departmentId: "d4",
    creatorId: "u3",
    assigneeId: "u3",
    media: { id: "m3", type: "IMAGE", alt: "Hiring post" },
    hashtags: ["Hiring", "Engineering", "Careers"],
    createdAt: at(-4, 9),
    updatedAt: at(-2, 10),
    performance: { impressions: 18400, engagements: 920, clicks: 310, reach: 15200 },
  },
  {
    id: "cp4",
    title: "Product Launch Teaser",
    caption: "Something big is coming. Can you guess what? 👀 #ProductLaunch",
    platform: "youtube",
    status: "DRAFT",
    schedule: { scheduledAt: iso(5, 12, 0), timezone: "Asia/Dhaka", recurrence: "NONE" },
    approval: { status: "PENDING", requestedAt: at(0, 9) },
    campaignId: "c3",
    departmentId: "d3",
    creatorId: "u4",
    assigneeId: "u4",
    media: { id: "m4", type: "VIDEO", alt: "Launch teaser" },
    hashtags: ["ProductLaunch", "ComingSoon"],
    notes: "Waiting on final render from studio.",
    createdAt: at(-1, 13),
    updatedAt: at(0, 9),
  },
  {
    id: "cp5",
    title: "Weekly Deals Drop",
    caption: "Fresh deals every week. This week: smart home bundles at 30% off.",
    platform: "x",
    status: "SCHEDULED",
    schedule: { scheduledAt: iso(2, 7, 0), timezone: "Asia/Dhaka", recurrence: "WEEKLY" },
    approval: { status: "APPROVED", requestedAt: at(-3, 10), decidedAt: at(-2, 11), decidedBy: "Jabed Hossain" },
    campaignId: "c5",
    departmentId: "d1",
    creatorId: "u2",
    assigneeId: "u2",
    media: { id: "m5", type: "CAROUSEL", alt: "Weekly deals" },
    hashtags: ["Deals", "SmartHome"],
    createdAt: at(-5, 15),
    updatedAt: at(-2, 11),
  },
  {
    id: "cp6",
    title: "Behind the Brand — TikTok",
    caption: "A day inside ENMASCO HQ. The team that builds your favourite tech. 🎬",
    platform: "tiktok",
    status: "FAILED",
    schedule: { scheduledAt: iso(-1, 18, 0), timezone: "Asia/Dhaka", recurrence: "NONE", failedReason: "Upload rejected: file too large" },
    approval: { status: "APPROVED", requestedAt: at(-2, 12), decidedAt: at(-2, 16), decidedBy: "Nusrat Jahan" },
    campaignId: "c2",
    departmentId: "d3",
    creatorId: "u4",
    assigneeId: "u4",
    media: { id: "m6", type: "VIDEO", alt: "Behind the brand" },
    hashtags: ["BehindTheScenes", "ENMASCO"],
    notes: "Re-render at 1080p and retry.",
    createdAt: at(-3, 14),
    updatedAt: at(-1, 18),
  },
  {
    id: "cp7",
    title: "Customer Story — Rahim Traders",
    caption: "How Rahim Traders grew 3x using ENMASCO solutions. Full case study inside.",
    platform: "linkedin",
    status: "APPROVED",
    schedule: { scheduledAt: iso(3, 11, 0), timezone: "Asia/Dhaka", recurrence: "NONE" },
    approval: { status: "APPROVED", requestedAt: at(-1, 10), decidedAt: at(0, 9), decidedBy: "Jabed Hossain" },
    campaignId: "c4",
    departmentId: "d4",
    creatorId: "u5",
    assigneeId: "u5",
    media: { id: "m7", type: "IMAGE", alt: "Case study" },
    hashtags: ["CaseStudy", "Growth"],
    createdAt: at(-2, 12),
    updatedAt: at(0, 9),
  },
  {
    id: "cp8",
    title: "Eid Greeting — Instagram",
    caption: "From our family to yours. Eid Mubarak! 🌙",
    platform: "instagram",
    status: "SCHEDULED",
    schedule: { scheduledAt: iso(0, 7, 0), timezone: "Asia/Dhaka", recurrence: "NONE" },
    approval: { status: "APPROVED", requestedAt: at(-2, 10), decidedAt: at(-1, 14), decidedBy: "Jabed Hossain" },
    campaignId: "c1",
    departmentId: "d3",
    creatorId: "u4",
    assigneeId: "u4",
    media: { id: "m8", type: "IMAGE", alt: "Eid greeting" },
    hashtags: ["EidMubarak", "Celebration"],
    createdAt: at(-3, 10),
    updatedAt: at(-1, 14),
  },
  {
    id: "cp9",
    title: "Founder Live — X Space",
    caption: "CEO goes live to answer your questions about the Q3 roadmap.",
    platform: "x",
    status: "SCHEDULED",
    schedule: { scheduledAt: iso(0, 20, 0), timezone: "Asia/Dhaka", recurrence: "NONE" },
    approval: { status: "NOT_REQUIRED" },
    campaignId: "c3",
    departmentId: "d4",
    creatorId: "u1",
    assigneeId: "u1",
    hashtags: ["Live", "Roadmap"],
    createdAt: at(-1, 9),
    updatedAt: at(-1, 9),
  },
  {
    id: "cp10",
    title: "YouTube Shorts — Unboxing",
    caption: "Unboxing our latest smart hub. Link in bio for early access.",
    platform: "youtube",
    status: "REVIEW",
    schedule: { scheduledAt: iso(4, 15, 0), timezone: "Asia/Dhaka", recurrence: "NONE" },
    approval: { status: "PENDING", requestedAt: at(0, 7) },
    campaignId: "c3",
    departmentId: "d3",
    creatorId: "u4",
    assigneeId: "u2",
    media: { id: "m9", type: "VIDEO", alt: "Unboxing" },
    hashtags: ["Unboxing", "SmartHub"],
    createdAt: at(0, 6),
    updatedAt: at(0, 7),
  },
  {
    id: "cp11",
    title: "Sales Webinar Invite",
    caption: "Free webinar: closing enterprise deals in 2026. Reserve your seat.",
    platform: "linkedin",
    status: "SCHEDULED",
    schedule: { scheduledAt: iso(1, 14, 0), timezone: "Asia/Dhaka", recurrence: "NONE" },
    approval: { status: "APPROVED", requestedAt: at(-2, 10), decidedAt: at(-1, 12), decidedBy: "Jabed Hossain" },
    campaignId: "c4",
    departmentId: "d2",
    creatorId: "u3",
    assigneeId: "u3",
    media: { id: "m10", type: "IMAGE", alt: "Webinar" },
    hashtags: ["Webinar", "Sales"],
    createdAt: at(-3, 11),
    updatedAt: at(-1, 12),
  },
  {
    id: "cp12",
    title: "TikTok Trend — Soundbyte",
    caption: "Our take on this week's trending sound. Watch till the end 😉",
    platform: "tiktok",
    status: "DRAFT",
    schedule: { scheduledAt: iso(6, 19, 0), timezone: "Asia/Dhaka", recurrence: "NONE" },
    approval: { status: "PENDING", requestedAt: at(0, 10) },
    campaignId: "c2",
    departmentId: "d3",
    creatorId: "u4",
    assigneeId: "u4",
    media: { id: "m11", type: "VIDEO", alt: "Trend soundbyte" },
    hashtags: ["Trend", "Soundbite"],
    createdAt: at(0, 10),
    updatedAt: at(0, 10),
  },
];

// ---------------------------------------------------------------------------
// Recent planning activity (mock)
// ---------------------------------------------------------------------------

export const planningActivity: PlanningActivity[] = [
  { id: "a1", type: "PUBLISHED", contentId: "cp3", contentTitle: "We're Hiring — Engineering", actorName: "MD Kazim", at: at(-2, 10, 2), detail: "Published to LinkedIn" },
  { id: "a2", type: "APPROVED", contentId: "cp7", contentTitle: "Customer Story — Rahim Traders", actorName: "Jabed Hossain", at: at(0, 9, 5), detail: "Approved for scheduling" },
  { id: "a3", type: "SCHEDULED", contentId: "cp1", contentTitle: "Eid Mega Sale Reveal", actorName: "Sara Khan", at: at(0, 8, 30), detail: "Scheduled for today 09:00" },
  { id: "a4", type: "EDITED", contentId: "cp5", contentTitle: "Weekly Deals Drop", actorName: "Sara Khan", at: at(-2, 11, 0), detail: "Updated caption + hashtags" },
  { id: "a5", type: "FAILED", contentId: "cp6", contentTitle: "Behind the Brand — TikTok", actorName: "System", at: at(-1, 18, 1), detail: "Upload rejected: file too large" },
  { id: "a6", type: "CREATED", contentId: "cp10", contentTitle: "YouTube Shorts — Unboxing", actorName: "Arif Rahman", at: at(0, 6, 0), detail: "Draft created" },
  { id: "a7", type: "COMMENT", contentId: "cp4", contentTitle: "Product Launch Teaser", actorName: "Nusrat Jahan", at: at(0, 9, 10), detail: "“Waiting on studio render”" },
];

// ---------------------------------------------------------------------------
// Lookup helpers (typed)
// ---------------------------------------------------------------------------

export const userById = (id?: string) => users.find((u) => u.id === id);
export const campaignById = (id?: string) => campaigns.find((c) => c.id === id);
export const departmentById = (id?: string) => departments.find((d) => d.id === id);

// ---------------------------------------------------------------------------
// Derived stats for the top KPI strip
// ---------------------------------------------------------------------------

export interface PlannerStats {
  totalPlanned: number;
  scheduledToday: number;
  drafts: number;
  published: number;
  pendingApproval: number;
  thisMonth: number;
}

export function computeStats(items: ContentPlan[]): PlannerStats {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday.getTime() + 86400000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const isSameDay = (s: string) => {
    const d = new Date(s);
    return d >= startOfToday && d < endOfToday;
  };

  const statusCount = (s: ContentStatus) => items.filter((i) => i.status === s).length;

  return {
    totalPlanned: items.length,
    scheduledToday: items.filter((i) => i.status === "SCHEDULED" && isSameDay(i.schedule.scheduledAt)).length,
    drafts: statusCount("DRAFT"),
    published: statusCount("PUBLISHED"),
    pendingApproval: items.filter(
      (i) => i.approval.status === "PENDING" || i.status === "REVIEW",
    ).length,
    thisMonth: items.filter((i) => new Date(i.schedule.scheduledAt) >= monthStart).length,
  };
}

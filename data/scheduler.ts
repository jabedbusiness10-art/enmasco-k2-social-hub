import type { ScheduledPost, PostStatus } from "@/types/scheduler";

// Mock dataset for the Real Publishing Scheduler.
// No real APIs — clean architecture ready for Meta Graph / LinkedIn / BullMQ.
// Dates are spread across the current month so Month/Week/Day views have content.

export const posts: ScheduledPost[] = [
  {
    id: "s1",
    title: "Eid Mega Promo",
    caption:
      "Celebrate Eid with 50% off across the entire store. Tap the link in bio before stock runs out! 🎉",
    platform: "facebook",
    mediaUrl: "/logo.svg",
    hashtags: ["EID", "PROMO", "MEGADEAL"],
    scheduledAt: shiftDate(0, 9, 30),
    status: "SCHEDULED",
    owner: "Jabed Hossain",
    campaign: "Eid eCommerce Blitz",
    timezone: "Asia/Riyadh",
    accent: "red",
  },
  {
    id: "s2",
    title: "Behind The Scenes Reel",
    caption:
      "A quick look at how our security team keeps your data safe — 5 tips you can use at home. 🔐",
    platform: "instagram",
    mediaUrl: "/logo.svg",
    hashtags: ["SECURITY", "REEL", "AWARENESS"],
    scheduledAt: shiftDate(0, 14, 15),
    status: "PUBLISHING",
    owner: "Sara Khan",
    campaign: "Security Awareness",
    timezone: "Asia/Riyadh",
    accent: "rose",
  },
  {
    id: "s3",
    title: "We Are Hiring",
    caption:
      "Excited to grow the team! We're looking for a Senior Platform Engineer. DM us. #NowHiring",
    platform: "linkedin",
    mediaUrl: "/logo.svg",
    hashtags: ["HIRING", "CAREERS"],
    scheduledAt: shiftDate(-1, 10, 0),
    status: "PUBLISHED",
    owner: "MD Kazim",
    timezone: "Asia/Riyadh",
    accent: "sky",
  },
  {
    id: "s4",
    title: "Product Launch Teaser",
    caption:
      "Something big is coming. Stay tuned for the reveal next week. 🚀",
    platform: "facebook",
    mediaUrl: "/logo.svg",
    hashtags: ["PRODUCT", "LAUNCH"],
    scheduledAt: shiftDate(2, 11, 0),
    status: "DRAFT",
    owner: "Jabed Hossain",
    campaign: "Product Launch",
    timezone: "Asia/Riyadh",
    accent: "violet",
  },
  {
    id: "s5",
    title: "Weekly Deal Drop",
    caption:
      "Fresh weekly deals are live now — swipe to see what's on sale this week.",
    platform: "instagram",
    mediaUrl: "/logo.svg",
    hashtags: ["PROMO", "WEEKLY"],
    scheduledAt: shiftDate(1, 18, 30),
    status: "SCHEDULED",
    owner: "Arif",
    campaign: "Weekly Deals",
    timezone: "Asia/Riyadh",
    accent: "amber",
  },
  {
    id: "s6",
    title: "Company Milestone",
    caption:
      "We just crossed 1M active users. Thank you to every customer who trusted us. 🙏",
    platform: "linkedin",
    mediaUrl: "/logo.svg",
    hashtags: ["MILESTONE", "UPDATE"],
    scheduledAt: shiftDate(-1, 9, 15),
    status: "FAILED",
    owner: "Nusrat",
    timezone: "Asia/Riyadh",
    accent: "emerald",
  },
  {
    id: "s7",
    title: "Customer Story",
    caption:
      "How one small business 3x'd revenue using K2KAI Social Flow. Full story inside.",
    platform: "facebook",
    mediaUrl: "/logo.svg",
    hashtags: ["CUSTOMER", "STORY"],
    scheduledAt: shiftDate(3, 16, 0),
    status: "SCHEDULED",
    owner: "Tanvir",
    campaign: "Social Proof",
    timezone: "Asia/Riyadh",
    accent: "red",
  },
  {
    id: "s8",
    title: "Holiday Closure Notice",
    caption:
      "Our support desk will be closed on the public holiday. Automated replies stay on. 💬",
    platform: "instagram",
    mediaUrl: "/logo.svg",
    hashtags: ["NOTICE"],
    scheduledAt: shiftDate(-2, 12, 0),
    status: "CANCELLED",
    owner: "Sara Khan",
    timezone: "Asia/Riyadh",
    accent: "violet",
  },
  {
    id: "s9",
    title: "LinkedIn Thought Leadership",
    caption:
      "3 trends reshaping enterprise social operations in 2026. A thread. 🧵",
    platform: "linkedin",
    mediaUrl: "/logo.svg",
    hashtags: ["THOUGHTLEADERSHIP", "2026"],
    scheduledAt: shiftDate(0, 20, 0),
    status: "SCHEDULED",
    owner: "MD Kazim",
    campaign: "Authority Building",
    timezone: "Asia/Riyadh",
    accent: "sky",
  },
];

export function deriveKpis(items: ScheduledPost[]) {
  const count = (s: PostStatus) => items.filter((p) => p.status === s).length;
  const today = new Date();
  const isToday = (iso: string) => {
    const d = new Date(iso);
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  };
  return [
    { label: "Upcoming", value: String(count("SCHEDULED") + count("PUBLISHING")) },
    { label: "Today", value: String(items.filter((p) => isToday(p.scheduledAt)).length) },
    { label: "Scheduled", value: String(count("SCHEDULED")) },
    { label: "Published", value: String(count("PUBLISHED")) },
    { label: "Failed", value: String(count("FAILED")) },
    { label: "Drafts", value: String(count("DRAFT")) },
  ];
}

// Helper: relative day offset from "now" at a fixed local hour/minute.
function shiftDate(dayOffset: number, hour: number, minute: number): string {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

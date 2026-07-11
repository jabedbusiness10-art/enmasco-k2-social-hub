import type { EngagementData, EngagementPlatform } from "@/types/engagement";

// Mock dataset — no real APIs. Architecture ready for Meta Graph /
// Instagram Graph / LinkedIn + WebSockets real-time analytics.

export const PLATFORM_LABELS: Record<EngagementPlatform, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  x: "X",
  tiktok: "TikTok",
  youtube: "YouTube",
};

export const REACTION_EMOJI: Record<string, string> = {
  LIKE: "👍",
  LOVE: "❤️",
  HAHA: "😂",
  WOW: "😮",
  SAD: "😢",
  ANGRY: "😡",
  COMMENT: "💬",
  SHARE: "🔄",
  SAVE: "📌",
  REACH: "👀",
  ENGAGEMENT_RATE: "📈",
};

export const engagement: EngagementData = {
  stats: [
    { key: "LIKE", label: "Likes", icon: "👍", total: 18420, growth: 12.4, trend: [20, 32, 28, 40, 45, 38, 52] },
    { key: "LOVE", label: "Loves", icon: "❤️", total: 9320, growth: 8.1, trend: [14, 18, 22, 19, 25, 30, 34] },
    { key: "HAHA", label: "Haha", icon: "😂", total: 2140, growth: -2.3, trend: [10, 9, 11, 8, 7, 9, 6] },
    { key: "WOW", label: "Wow", icon: "😮", total: 1870, growth: 5.6, trend: [5, 6, 7, 8, 7, 9, 10] },
    { key: "SAD", label: "Sad", icon: "😢", total: 320, growth: -1.1, trend: [4, 3, 3, 2, 3, 2, 2] },
    { key: "ANGRY", label: "Angry", icon: "😡", total: 210, growth: 0.4, trend: [2, 2, 3, 2, 2, 3, 3] },
    { key: "COMMENT", label: "Comments", icon: "💬", total: 6480, growth: 15.2, trend: [25, 30, 28, 35, 40, 42, 48] },
    { key: "SHARE", label: "Shares", icon: "🔄", total: 3120, growth: 9.7, trend: [12, 14, 13, 16, 18, 17, 20] },
    { key: "SAVE", label: "Saves", icon: "📌", total: 2740, growth: 22.8, trend: [8, 10, 12, 15, 18, 22, 26] },
    { key: "REACH", label: "Reach", icon: "👀", total: 482300, growth: 18.3, trend: [200, 240, 260, 300, 320, 360, 410] },
    {
      key: "ENGAGEMENT_RATE",
      label: "Engagement Rate",
      icon: "📈",
      total: 7.4,
      growth: 3.2,
      trend: [5, 5.4, 5.8, 6.2, 6.6, 7, 7.4],
    },
    { key: "LIKE", label: "Total Reactions", icon: "❤️", total: 42420, growth: 11.9, trend: [80, 90, 95, 110, 120, 128, 140] },
  ],

  activity: [
    { id: "a1", platform: "facebook", customer: "Ahmed Khan", avatar: "AK", reaction: "LIKE", postPreview: "New CCTV Offer is live!", at: "2026-07-11T09:12:00Z" },
    { id: "a2", platform: "instagram", customer: "Sarah Lima", avatar: "SL", reaction: "LOVE", postPreview: "Behind the scenes reel", at: "2026-07-11T08:55:00Z" },
    { id: "a3", platform: "linkedin", customer: "John Reyes", avatar: "JR", reaction: "COMMENT", postPreview: "Enterprise security webinar", at: "2026-07-11T08:30:00Z" },
    { id: "a4", platform: "facebook", customer: "Michael Tan", avatar: "MT", reaction: "SHARE", postPreview: "New CCTV Offer is live!", at: "2026-07-11T07:48:00Z" },
    { id: "a5", platform: "instagram", customer: "Nadia P.", avatar: "NP", reaction: "SAVE", postPreview: "Eid Mega Promo", at: "2026-07-11T07:10:00Z" },
    { id: "a6", platform: "linkedin", customer: "Wei Chen", avatar: "WC", reaction: "WOW", postPreview: "AI firewall launch", at: "2026-07-11T06:22:00Z" },
    { id: "a7", platform: "instagram", customer: "Rahim U.", avatar: "RU", reaction: "COMMENT", postPreview: "Behind the scenes reel", at: "2026-07-11T05:40:00Z" },
    { id: "a8", platform: "facebook", customer: "Fatima S.", avatar: "FS", reaction: "HAHA", postPreview: "Office prank blooper", at: "2026-07-10T22:15:00Z" },
  ],

  topPosts: [
    {
      id: "p1",
      platform: "instagram",
      caption: "Eid Mega Promo — 30% off on all CCTV bundles 🎉",
      thumbnail: "📸",
      likes: 8420,
      comments: 412,
      shares: 320,
      reach: 142000,
      engagementRate: 9.8,
      createdAt: "2026-07-09T10:00:00Z",
    },
    {
      id: "p2",
      platform: "facebook",
      caption: "New CCTV Offer is live! Secure your home today.",
      thumbnail: "🎥",
      likes: 6210,
      comments: 530,
      shares: 480,
      reach: 198000,
      engagementRate: 8.4,
      createdAt: "2026-07-11T07:00:00Z",
    },
    {
      id: "p3",
      platform: "linkedin",
      caption: "Enterprise security webinar — key takeaways",
      thumbnail: "📊",
      likes: 3120,
      comments: 240,
      shares: 610,
      reach: 88000,
      engagementRate: 11.2,
      createdAt: "2026-07-10T14:00:00Z",
    },
    {
      id: "p4",
      platform: "instagram",
      caption: "Behind the scenes reel from our NOC team",
      thumbnail: "🎬",
      likes: 4980,
      comments: 188,
      shares: 142,
      reach: 96000,
      engagementRate: 7.1,
      createdAt: "2026-07-08T18:00:00Z",
    },
  ],

  daily: [
    { label: "Mon", value: 4200 },
    { label: "Tue", value: 5100 },
    { label: "Wed", value: 4800 },
    { label: "Thu", value: 6200 },
    { label: "Fri", value: 7400 },
    { label: "Sat", value: 8900 },
    { label: "Sun", value: 7100 },
  ],
  weekly: [
    { label: "W1", value: 31200 },
    { label: "W2", value: 35800 },
    { label: "W3", value: 34100 },
    { label: "W4", value: 41200 },
    { label: "W5", value: 46800 },
    { label: "W6", value: 52400 },
  ],
  monthly: [
    { label: "Jan", value: 120000 },
    { label: "Feb", value: 138000 },
    { label: "Mar", value: 152000 },
    { label: "Apr", value: 168000 },
    { label: "May", value: 184000 },
    { label: "Jun", value: 206000 },
    { label: "Jul", value: 224000 },
  ],

  platformComparison: [
    { platform: "facebook", value: 184200 },
    { platform: "instagram", value: 162800 },
    { platform: "linkedin", value: 77400 },
  ],

  reactionDistribution: [
    { type: "LIKE", value: 18420 },
    { type: "LOVE", value: 9320 },
    { type: "HAHA", value: 2140 },
    { type: "WOW", value: 1870 },
    { type: "SAD", value: 320 },
    { type: "ANGRY", value: 210 },
    { type: "COMMENT", value: 6480 },
    { type: "SHARE", value: 3120 },
    { type: "SAVE", value: 2740 },
  ],

  growthTrend: [
    { label: "Jan", value: 4.2 },
    { label: "Feb", value: 4.8 },
    { label: "Mar", value: 5.1 },
    { label: "Apr", value: 5.6 },
    { label: "May", value: 6.2 },
    { label: "Jun", value: 6.9 },
    { label: "Jul", value: 7.4 },
  ],

  live: {
    monitoring: true,
    lastSync: new Date().toISOString(),
    dataSource: "Meta Graph · Instagram Graph · LinkedIn API (mock)",
    refresh: "live",
  },
};

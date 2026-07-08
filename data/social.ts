import type { SocialAccount, SocialPost } from "@/types/social";

export const socialAccounts: SocialAccount[] = [
  { id: "fb", platform: "FACEBOOK", connected: true, followers: 21500, engagement: 6.4 },
  { id: "ig", platform: "INSTAGRAM", connected: true, followers: 13900, engagement: 8.1 },
  { id: "li", platform: "LINKEDIN", connected: true, followers: 8420, engagement: 5.3 },
  { id: "yt", platform: "YOUTUBE", connected: false, followers: 12400, engagement: 4.7 },
  { id: "x", platform: "X", connected: true, followers: 9300, engagement: 3.9 },
];

export const socialPosts: SocialPost[] = [
  {
    id: "p1",
    platform: "FACEBOOK",
    caption: "New product launch campaign for EnmaSco K2.",
    status: "PUBLISHED",
    publishDate: "2026-07-08",
  },
  {
    id: "p2",
    platform: "INSTAGRAM",
    caption: "Reels teaser: Behind the scenes of our latest automation build.",
    status: "SCHEDULED",
    publishDate: "2026-07-09",
  },
  {
    id: "p3",
    platform: "LINKEDIN",
    caption: "Thought leadership post on enterprise AI adoption.",
    status: "DRAFT",
    publishDate: "2026-07-10",
  },
  {
    id: "p4",
    platform: "X",
    caption: "Announcing the new Security Ops dashboard.",
    status: "PUBLISHED",
    publishDate: "2026-07-07",
  },
  {
    id: "p5",
    platform: "FACEBOOK",
    caption: "Customer success story: automation in action.",
    status: "SCHEDULED",
    publishDate: "2026-07-11",
  },
];

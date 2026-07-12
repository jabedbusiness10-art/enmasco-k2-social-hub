import type { CEOKPI, PlatformHealthItem, NotificationItem, InboxItem, ActivityItem, SocialPlatformStat, AutomationRun, CalendarItem } from "@/types/ceo";

export const ceoKPIs: CEOKPI[] = [
  {
    id: "TEAM",
    title: "Active Team Members",
    metrics: [
      { label: "Online", value: 22 },
      { label: "Offline", value: 8 },
      { label: "Working Today", value: 30 },
    ],
  },
  {
    id: "PLATFORMS",
    title: "Connected Platforms",
    metrics: [
      { label: "Facebook", value: "Connected" },
      { label: "Instagram", value: "Connected" },
      { label: "LinkedIn", value: "Connected" },
      { label: "X", value: "Connected" },
      { label: "YouTube", value: "Connected" },
    ],
  },
  {
    id: "POSTS",
    title: "Published Posts",
    metrics: [
      { label: "Today", value: 6 },
      { label: "This Week", value: 38 },
      { label: "This Month", value: 142 },
    ],
  },
  {
    id: "SCHEDULED",
    title: "Scheduled Posts",
    metrics: [
      { label: "Upcoming Posts", value: 24 },
      { label: "Today's Queue", value: 7 },
    ],
  },
  {
    id: "ENGAGEMENT",
    title: "Engagement Rate",
    metrics: [
      { label: "Overall Engagement", value: "7.2%" },
      { label: "Platform Comparison", value: "+0.4%" },
    ],
  },
  {
    id: "REACH",
    title: "Total Reach",
    metrics: [
      { label: "Combined Reach", value: "384K" },
      { label: "Weekly Growth", value: "+12%" },
    ],
  },
  {
    id: "CAMPAIGNS",
    title: "Active Campaigns",
    metrics: [
      { label: "Running", value: 3 },
      { label: "Completed", value: 7 },
      { label: "Pending", value: 1 },
    ],
  },
  {
    id: "AI",
    title: "K2Kai AI Usage",
    metrics: [
      { label: "AI Requests", value: 128 },
      { label: "Generated Captions", value: 84 },
      { label: "Reports", value: 12 },
      { label: "Content Created", value: 45 },
    ],
  },
  {
    id: "AUTOMATION",
    title: "K2Flow Automation",
    metrics: [
      { label: "Running Workflows", value: 3 },
      { label: "Success Rate", value: "98%" },
      { label: "Failed Jobs", value: 1 },
    ],
  },
  {
    id: "APPROVALS",
    title: "Pending Approvals",
    metrics: [
      { label: "Posts", value: 4 },
      { label: "Campaigns", value: 1 },
      { label: "Content", value: 2 },
      { label: "AI Suggestions", value: 1 },
    ],
  },
  {
    id: "INBOX",
    title: "Unified Inbox",
    metrics: [
      { label: "Facebook Comments", value: 18 },
      { label: "Instagram Messages", value: 9 },
      { label: "LinkedIn Messages", value: 5 },
      { label: "Pending Replies", value: 7 },
    ],
  },
  {
    id: "HEALTH",
    title: "Platform Health",
    metrics: [
      { label: "API Status", value: "Healthy" },
      { label: "Token Status", value: "Valid" },
      { label: "Workflow Status", value: "Running" },
    ],
  },
];

export const platformHealth: PlatformHealthItem[] = [
  { name: "Facebook", status: "connected" },
  { name: "Instagram", status: "connected" },
  { name: "LinkedIn", status: "warning", detail: "Token expires soon" },
  { name: "X", status: "connected" },
  { name: "YouTube", status: "connected" },
  { name: "K2Kai AI", status: "connected" },
  { name: "K2Flow", status: "connected" },
];

export const notifications: NotificationItem[] = [
  { id: "n1", title: "Campaign Completed", message: "Eid eCommerce Blitz finished.", time: "10 min", severity: "info" },
  { id: "n2", title: "Automation Failed", message: "Monthly report job failed.", time: "35 min", severity: "error" },
  { id: "n3", title: "Platform Disconnected", message: "LinkedIn token expired.", time: "1 hr", severity: "warning" },
  { id: "n4", title: "AI Report Generated", message: "Weekly social report ready.", time: "2 hr", severity: "info" },
  { id: "n5", title: "New Approval Request", message: "Campaign: Security Roundup.", time: "3 hr", severity: "info" },
];

export const inbox: InboxItem[] = [
  { id: "i1", platform: "Facebook", type: "Comments", count: 18 },
  { id: "i2", platform: "Instagram", type: "Messages", count: 9 },
  { id: "i3", platform: "LinkedIn", type: "Messages", count: 5 },
  { id: "i4", platform: "Unified", type: "Pending Replies", count: 7 },
];

export const recentActivities: ActivityItem[] = [
  { id: "a1", user: "MD Kazim", action: "Published Eid promo post", time: "09:15 AM" },
  { id: "a2", user: "Sara Khan", action: "Approved Security Roundup", time: "09:40 AM" },
  { id: "a3", user: "Arif", action: "Updated K2Kai AI settings", time: "10:05 AM" },
  { id: "a4", user: "Nusrat", action: "Scheduled 3 posts", time: "10:30 AM" },
  { id: "a5", user: "MD Kazim", action: "Reviewed automation logs", time: "11:00 AM" },
];

export const socialStats: SocialPlatformStat[] = [
  { platform: "Facebook", followers: 21500, reach: 120000, engagement: 6.4, topPost: "Eid promo", growth: "+1.2%" },
  { platform: "Instagram", followers: 13900, reach: 98000, engagement: 8.1, topPost: "Reel teaser", growth: "+2.4%" },
  { platform: "LinkedIn", followers: 8420, reach: 64000, engagement: 5.3, topPost: "Job post", growth: "+0.8%" },
  { platform: "YouTube", followers: 12400, reach: 38000, engagement: 4.7, topPost: "Tutorial #12", growth: "+1.1%" },
  { platform: "X", followers: 9300, reach: 54000, engagement: 3.9, topPost: "Thread update", growth: "+0.4%" },
];

export const automationRuns: AutomationRun[] = [
  { id: "r1", name: "Daily Social Posting", status: "completed", startedAt: "2026-07-08 08:00" },
  { id: "r2", name: "Auto Caption + Schedule", status: "running", startedAt: "2026-07-08 10:30" },
  { id: "r3", name: "Weekly Report Generator", status: "failed", startedAt: "2026-07-07 09:00" },
];

export const calendarItems: CalendarItem[] = [
  { id: "c1", title: "Eid promo post", time: "09:00 AM", type: "post" },
  { id: "c2", title: "Security roundup campaign", time: "11:30 AM", type: "campaign" },
  { id: "c3", title: "Weekly patrol duty", time: "02:00 PM", type: "duty" },
];

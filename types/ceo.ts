export type KPICategory =
  | "TEAM"
  | "PLATFORMS"
  | "POSTS"
  | "SCHEDULED"
  | "ENGAGEMENT"
  | "REACH"
  | "CAMPAIGNS"
  | "AI"
  | "AUTOMATION"
  | "APPROVALS"
  | "INBOX"
  | "HEALTH";

export interface CEOKPI {
  id: KPICategory;
  title: string;
  metrics: { label: string; value: string | number }[];
}

export interface PlatformHealthItem {
  name: string;
  status: "connected" | "warning" | "error";
  detail?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  severity: "info" | "warning" | "error";
}

export interface InboxItem {
  id: string;
  platform: string;
  type: string;
  count: number;
}

export interface ActivityItem {
  id: string;
  user: string;
  action: string;
  time: string;
}

export interface SocialPlatformStat {
  platform: string;
  followers: number;
  reach: number;
  engagement: number;
  topPost: string;
  growth: string;
}

export interface AutomationRun {
  id: string;
  name: string;
  status: "running" | "completed" | "failed";
  startedAt: string;
}

export interface CalendarItem {
  id: string;
  title: string;
  time: string;
  type: "post" | "campaign" | "duty";
}

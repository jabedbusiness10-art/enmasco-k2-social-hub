export type NotificationType =
  | "SYSTEM"
  | "AI"
  | "PUBLISH"
  | "MESSAGE"
  | "APPROVAL"
  | "AUTOMATION"
  | "SECURITY"
  | "WORKFLOW";

export type NotificationPriority = "LOW" | "MEDIUM" | "HIGH";

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: NotificationType;
  platform: string;
  priority: NotificationPriority;
  read: boolean;
  createdAt: string;
  action?: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  time: string;
}

export interface NotificationSetting {
  id: string;
  label: string;
  enabled: boolean;
}

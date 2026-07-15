export type NotificationType =
  | "SOCIAL"
  | "PUBLISH"
  | "AI"
  | "MEDIA"
  | "TEAM"
  | "ANALYTICS"
  | "SECURITY"
  | "SYSTEM"
  | "MARKETING"
  | "APPROVAL"
  | "AUTOMATION";

export type NotificationPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";

export type NotificationCategory =
  | "SOCIAL"
  | "PUBLISHING"
  | "AI"
  | "MEDIA"
  | "ASSIGNMENTS"
  | "ANALYTICS"
  | "SECURITY"
  | "SYSTEM"
  | "MENTIONS"
  | "MESSAGES";

export interface Notification {
  id: string;
  type: NotificationType;
  category?: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  body?: string | null;
  /** @deprecated legacy alias kept for the admin/notifications mock view */
  description?: string | null;
  module?: string | null;
  platform?: string | null;
  entity?: string | null;
  entityType?: string | null;
  department?: string | null;
  senderId?: string | null;
  senderName?: string | null;
  isRead?: boolean;
  isArchived?: boolean;
  /** @deprecated legacy alias kept for the admin/notifications mock view */
  read?: boolean;
  meta?: string | null;
  createdAt: string;
  userId?: string;
}

export interface NotificationPreference {
  id: string;
  userId: string;
  desktop: boolean;
  browser: boolean;
  email: boolean;
  sound: boolean;
  mentions: boolean;
  assignments: boolean;
  publishing: boolean;
  ai: boolean;
  security: boolean;
  digest: string;
  quietFrom?: string | null;
  quietTo?: string | null;
}

export interface ActivityItem {
  id: string;
  title: string;
  time: string;
}

/** @deprecated legacy alias used by the admin/notifications mock view */
export interface NotificationSetting {
  id: string;
  label: string;
  enabled: boolean;
}

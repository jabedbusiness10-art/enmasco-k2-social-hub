import type { Notification, ActivityItem, NotificationSetting } from "@/types/notification";

export const notifications: Notification[] = [
  { id: "n1", title: "Post Published", description: "Eid Promo Post published on Facebook.", type: "PUBLISH", platform: "Facebook", priority: "HIGH", read: false, createdAt: "2026-07-08 18:00" },
  { id: "n2", title: "AI Caption Generated", description: "K2Kai generated 5 captions for LinkedIn.", type: "AI", platform: "AI", priority: "MEDIUM", read: false, createdAt: "2026-07-08 17:45" },
  { id: "n3", title: "Approval Required", description: "Campaign approval pending from CEO.", type: "APPROVAL", platform: "CEO", priority: "HIGH", read: false, createdAt: "2026-07-08 17:30" },
  { id: "n4", title: "Workflow Completed", description: "Daily content scheduler completed successfully.", type: "AUTOMATION", platform: "Automation", priority: "LOW", read: true, createdAt: "2026-07-08 16:00" },
  { id: "n5", title: "New Message", description: "New Instagram DM from customer.", type: "SOCIAL", platform: "Instagram", priority: "MEDIUM", read: false, createdAt: "2026-07-08 15:20" },
  { id: "n6", title: "System Update", description: "Platform maintenance completed.", type: "SYSTEM", platform: "System", priority: "LOW", read: true, createdAt: "2026-07-08 12:00" },
  { id: "n7", title: "Security Alert", description: "Password changed successfully.", type: "SECURITY", platform: "System", priority: "HIGH", read: false, createdAt: "2026-07-08 11:00" },
  { id: "n8", title: "Automation Event", description: "Analytics sync job failed.", type: "AUTOMATION", platform: "Automation", priority: "MEDIUM", read: false, createdAt: "2026-07-08 10:00" },
  { id: "n9", title: "LinkedIn Published", description: "Weekly product post published.", type: "PUBLISH", platform: "LinkedIn", priority: "MEDIUM", read: true, createdAt: "2026-07-08 09:00" },
  { id: "n10", title: "AI Report Ready", description: "Weekly social insights report generated.", type: "AI", platform: "AI", priority: "LOW", read: false, createdAt: "2026-07-08 08:00" },
];

export const activities: ActivityItem[] = [
  { id: "a1", title: "AI Caption Generated", time: "09:30" },
  { id: "a2", title: "Facebook Scheduled", time: "09:45" },
  { id: "a3", title: "CEO Approved Campaign", time: "10:10" },
  { id: "a4", title: "Workflow Completed", time: "10:40" },
  { id: "a5", title: "LinkedIn Published", time: "11:15" },
];

export const notificationSettings: NotificationSetting[] = [
  { id: "s1", label: "Push Notification", enabled: true },
  { id: "s2", label: "Email Notification", enabled: true },
  { id: "s3", label: "Desktop Notification", enabled: true },
  { id: "s4", label: "Automation Alerts", enabled: true },
  { id: "s5", label: "AI Alerts", enabled: true },
  { id: "s6", label: "Security Alerts", enabled: true },
  { id: "s7", label: "Daily Summary", enabled: false },
];

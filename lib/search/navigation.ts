/**
 * TASK-61 — Navigation + command registry (real targets only).
 * Every href below is an EXISTING route in this project (sourced from
 * navigation/sidebarConfig.ts). Commands either navigate or run a real
 * client/server action. Admin-only commands are gated by `permission`.
 */
import type { Permission } from "@/types/auth";

export interface NavTarget {
  id: string;
  label: string;
  href: string;
  category: string;
  permission?: Permission; // if set, only users with it see this
  keywords?: string[];
}

export const NAV_TARGETS: NavTarget[] = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard", category: "Dashboard" },
  { id: "executive", label: "Executive", href: "/dashboard/executive", category: "Executive" },
  { id: "activity-feed", label: "Activity Feed", href: "/dashboard/executive/activity-feed", category: "Executive" },
  { id: "monitoring", label: "System", href: "/monitoring", category: "Administration", permission: "MANAGE_USERS" },
  { id: "social", label: "Social", href: "/dashboard/social", category: "Social" },
  { id: "social-accounts", label: "Connected Accounts", href: "/dashboard/social/accounts", category: "Social" },
  { id: "engagement", label: "Engagement Monitor", href: "/dashboard/social/engagement", category: "Social" },
  { id: "planner", label: "Content Planner", href: "/dashboard/social/planner", category: "Social" },
  { id: "publisher", label: "Publishing Scheduler", href: "/dashboard/social/publisher", category: "Publishing" },
  { id: "media", label: "Media Library", href: "/dashboard/media", category: "Media" },
  { id: "collections", label: "Collections", href: "/dashboard/media?view=collections", category: "Media" },
  { id: "tags", label: "Tags", href: "/dashboard/media?view=tags", category: "Media" },
  { id: "messenger", label: "K2 Messenger", href: "/dashboard/messenger", category: "Messenger" },
  { id: "inbox-unified", label: "Unified Inbox", href: "/dashboard/inbox/unified", category: "Inbox" },
  { id: "ai-studio", label: "K2Kai Studio", href: "/dashboard/ai/studio", category: "AI" },
  { id: "ai-workflows", label: "Workflow Automation", href: "/dashboard/ai/workflows", category: "Automation" },
  { id: "insights", label: "Analytics", href: "/dashboard/insights/analytics", category: "Analytics" },
  { id: "insights-reports", label: "Reports", href: "/dashboard/insights/reports", category: "Reports" },
  { id: "team", label: "Team", href: "/dashboard/team", category: "Team" },
  { id: "team-members", label: "Members", href: "/dashboard/team/members", category: "Team" },
  { id: "team-tasks", label: "Tasks", href: "/dashboard/team/tasks", category: "Team" },
  { id: "team-roles", label: "Roles & Permissions", href: "/dashboard/team/roles", category: "Team", permission: "MANAGE_ROLES" },
  { id: "queue", label: "Queue Engine", href: "/dashboard/queue", category: "Queue" },
  { id: "queue-jobs", label: "Jobs", href: "/dashboard/queue/jobs", category: "Queue", permission: "SOCIAL_CONNECT" },
  { id: "queue-failed", label: "Failed Jobs", href: "/dashboard/queue/failed", category: "Queue", permission: "SOCIAL_CONNECT" },
  { id: "queue-workers", label: "Workers", href: "/dashboard/queue/workers", category: "Queue", permission: "SOCIAL_CONNECT" },
  { id: "queue-health", label: "Queue Health", href: "/dashboard/queue/health", category: "Queue", permission: "SOCIAL_CONNECT" },
  { id: "notifications", label: "Notifications", href: "/dashboard/notifications", category: "Notifications" },
  { id: "admin-users", label: "Users", href: "/dashboard/admin/users", category: "Administration", permission: "MANAGE_USERS" },
  { id: "admin-security", label: "Security", href: "/dashboard/admin/security/overview", category: "Administration", permission: "MANAGE_USERS" },
  { id: "admin-api", label: "API Connections", href: "/dashboard/admin/api", category: "Administration", permission: "MANAGE_USERS" },
  { id: "admin-audit", label: "Audit Logs", href: "/dashboard/admin/security/audit", category: "Administration", permission: "MANAGE_USERS" },
  { id: "admin-backup", label: "Backup", href: "/dashboard/admin/backup", category: "Administration", permission: "MANAGE_USERS" },
  { id: "admin-company", label: "Company Settings", href: "/dashboard/admin/company", category: "Administration", permission: "MANAGE_USERS" },
];

export function filterByRole<T extends { permission?: Permission }>(items: T[], hasPerm: (p: Permission) => boolean): T[] {
  return items.filter((i) => !i.permission || hasPerm(i.permission));
}

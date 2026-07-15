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
  { id: "executive", label: "Executive Dashboard", href: "/dashboard/executive", category: "Executive" },
  { id: "activity-feed", label: "Activity Feed", href: "/dashboard/executive/activity-feed", category: "Executive" },
  { id: "monitoring", label: "Monitoring & Health", href: "/dashboard/monitoring", category: "Administration", permission: "MANAGE_USERS" },
  { id: "social", label: "Social Hub", href: "/dashboard/social", category: "Social" },
  { id: "social-accounts", label: "Social Accounts", href: "/dashboard/social/accounts", category: "Social" },
  { id: "social-calendar", label: "Social Calendar", href: "/dashboard/social/calendar", category: "Social" },
  { id: "campaigns", label: "Campaigns", href: "/dashboard/social/campaigns", category: "Social" },
  { id: "social-drafts", label: "Drafts", href: "/dashboard/social/drafts", category: "Social" },
  { id: "engagement", label: "Engagement", href: "/dashboard/social/engagement", category: "Social" },
  { id: "social-messages", label: "Social Messages", href: "/dashboard/social/messages", category: "Social" },
  { id: "planner", label: "Content Planner", href: "/dashboard/social/planner", category: "Social" },
  { id: "publisher", label: "Publisher", href: "/dashboard/social/publisher", category: "Publishing" },
  { id: "media", label: "Media Library", href: "/dashboard/media?view=assets", category: "Media" },
  { id: "collections", label: "Collections", href: "/dashboard/media?view=collections", category: "Media" },
  { id: "tags", label: "Tags", href: "/dashboard/media?view=tags", category: "Media" },
  { id: "messenger", label: "K2 Messenger", href: "/dashboard/messenger", category: "Messenger" },
  { id: "inbox-unified", label: "Unified Inbox", href: "/dashboard/inbox/unified", category: "Inbox" },
  { id: "inbox-facebook", label: "Facebook Inbox", href: "/dashboard/inbox/facebook", category: "Inbox" },
  { id: "inbox-instagram", label: "Instagram Inbox", href: "/dashboard/inbox/instagram", category: "Inbox" },
  { id: "inbox-linkedin", label: "LinkedIn Inbox", href: "/dashboard/inbox/linkedin", category: "Inbox" },
  { id: "ai-studio", label: "AI Studio", href: "/dashboard/ai/studio", category: "AI" },
  { id: "ai-captions", label: "AI Captions", href: "/dashboard/ai/captions", category: "AI" },
  { id: "ai-reply", label: "AI Reply", href: "/dashboard/ai/reply", category: "AI" },
  { id: "ai-logs", label: "AI Logs", href: "/dashboard/ai/logs", category: "AI" },
  { id: "ai-workflows", label: "Automation Workflows", href: "/dashboard/ai/workflows", category: "Automation" },
  { id: "insights", label: "Insights Analytics", href: "/dashboard/insights/analytics", category: "Analytics" },
  { id: "insights-reach", label: "Reach", href: "/dashboard/insights/reach", category: "Analytics" },
  { id: "insights-engagement", label: "Engagement Insights", href: "/dashboard/insights/engagement", category: "Analytics" },
  { id: "insights-audience", label: "Audience", href: "/dashboard/insights/audience", category: "Analytics" },
  { id: "insights-reports", label: "Reports", href: "/dashboard/insights/reports", category: "Reports" },
  { id: "insights-live", label: "Live Analytics", href: "/dashboard/insights/live", category: "Analytics" },
  { id: "team", label: "Team", href: "/dashboard/team", category: "Team" },
  { id: "team-members", label: "Team Members", href: "/dashboard/team/members", category: "Team" },
  { id: "team-tasks", label: "Duty Routine", href: "/dashboard/team/tasks", category: "Team" },
  { id: "team-roles", label: "Team Roles", href: "/dashboard/team/roles", category: "Team", permission: "MANAGE_ROLES" },
  { id: "queue", label: "Queue Engine", href: "/dashboard/queue", category: "Queue" },
  { id: "queue-jobs", label: "Queue Jobs", href: "/dashboard/queue/jobs", category: "Queue", permission: "SOCIAL_CONNECT" },
  { id: "queue-failed", label: "Failed Jobs", href: "/dashboard/queue/failed", category: "Queue", permission: "SOCIAL_CONNECT" },
  { id: "queue-workers", label: "Queue Workers", href: "/dashboard/queue/workers", category: "Queue", permission: "SOCIAL_CONNECT" },
  { id: "queue-health", label: "Queue Health", href: "/dashboard/queue/health", category: "Queue", permission: "SOCIAL_CONNECT" },
  { id: "notifications", label: "Notifications", href: "/dashboard/notifications", category: "Notifications" },
  { id: "admin-users", label: "User Management", href: "/dashboard/admin/users", category: "Administration", permission: "MANAGE_USERS" },
  { id: "admin-security", label: "Security", href: "/dashboard/admin/security", category: "Administration", permission: "MANAGE_USERS" },
  { id: "admin-api", label: "API Connections", href: "/dashboard/admin/api", category: "Administration", permission: "MANAGE_USERS" },
  { id: "admin-audit", label: "Audit Logs", href: "/dashboard/admin/audit", category: "Administration", permission: "MANAGE_USERS" },
  { id: "admin-backup", label: "Backup & Restore", href: "/dashboard/admin/backup", category: "Administration", permission: "MANAGE_USERS" },
  { id: "admin-company", label: "Company Settings", href: "/dashboard/admin/company", category: "Administration", permission: "MANAGE_USERS" },
];

export function filterByRole<T extends { permission?: Permission }>(items: T[], hasPerm: (p: Permission) => boolean): T[] {
  return items.filter((i) => !i.permission || hasPerm(i.permission));
}

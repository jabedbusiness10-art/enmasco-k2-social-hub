"use client";

import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Network,
  MessageCircle,
  Users,
  Bot,
  BarChart3,
  Inbox,
  ShieldCheck,
  Images,
  Layers,
  // social
  Link2,
  CalendarClock,
  PenLine,
  FileEdit,
  Megaphone,
  CalendarDays,
  Activity,
  MessageSquare,
  Mail,
  // messenger
  Hash,
  Users2,
  Volume2,
  Paperclip,
  Star,
  Archive,
  // team
  UserCog,
  KeyRound,
  ListChecks,
  ScrollText,
  // ai
  Sparkles,
  Wand2,
  Workflow,
  // insights
  TrendingUp,
  Eye,
  Heart,
  Users as UsersIcon,
  FileText,
  Radio,
  // inbox (brand icons substituted with generic + per-platform initials in UI)
  MessageCircle as FacebookIcon,
  MessageCircle as InstagramIcon,
  MessageCircle as LinkedinIcon,
  // admin
  Building2,
  Settings,
  Plug,
  Lock,
  ShieldAlert,
  Bell,
  Database,
  HeartPulse,
  UserPlus,
  Globe,
} from "lucide-react";

export type NavChild = {
  label: string;
  href: string;
  /** short description for page header */
  description?: string;
};

export type NavSection = {
  key: string;
  label: string;
  icon: LucideIcon;
  href: string;
  /** breadcrumb segment label for the module root */
  crumb: string;
  children: NavChild[];
  expandable?: boolean;
};

// Blueprint v1.0 (Architecture Freeze) — single source of truth for navigation.
// Route Registry §3 + Naming Convention §8. Every route here is the canonical path.
export const sidebarConfig: NavSection[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    crumb: "Dashboard",
    expandable: false,
    children: [],
  },
  {
    key: "social",
    label: "Social",
    icon: Network,
    href: "/dashboard/social",
    crumb: "Social",
    children: [
      { label: "Connected Accounts", href: "/dashboard/social/accounts", description: "Connect and manage Facebook, Instagram, LinkedIn and website accounts." },
      { label: "Publishing Scheduler", href: "/dashboard/social/publisher", description: "Schedule and publish posts across all connected platforms." },
      { label: "Content Planner", href: "/dashboard/social/planner", description: "Plan and organize content ideas into a calendar." },
      { label: "Social Calendar", href: "/dashboard/social/calendar", description: "Visual calendar of all scheduled and published content." },
      { label: "Draft Posts", href: "/dashboard/social/drafts", description: "Create and manage draft posts before publishing." },
      { label: "Campaign Manager", href: "/dashboard/social/campaigns", description: "Create and track marketing campaigns across platforms." },
      { label: "Engagement Monitor", href: "/dashboard/social/engagement", description: "Monitor likes, comments, and reactions in real time." },
      { label: "Comments", href: "/dashboard/social/comments", description: "Review and respond to comments from all platforms." },
      { label: "Messages", href: "/dashboard/social/messages", description: "Social conversation threads and direct messages from platforms." },
      { label: "Facebook Live", href: "/dashboard/social/facebook", description: "Real-time Facebook page data: followers, posts and inbox messages." },
    ],
  },
  {
    key: "team",
    label: "Team",
    icon: Users,
    href: "/dashboard/team",
    crumb: "Team",
    children: [
      { label: "Members", href: "/dashboard/team/members", description: "Manage team members, profiles, and access." },
      { label: "Roles & Permissions", href: "/dashboard/team/roles", description: "Define roles and control what each member can do." },
      { label: "Tasks", href: "/dashboard/team/tasks", description: "Assign and track team tasks and routines." },
      { label: "Activity Logs", href: "/dashboard/team/activity", description: "Audit trail of team actions and changes." },
    ],
  },
  {
    key: "messenger",
    label: "K2 Messenger",
    icon: MessageCircle,
    href: "/dashboard/messenger",
    crumb: "K2 Messenger",
    children: [
      { label: "Direct Messages", href: "/dashboard/messenger/direct", description: "One-on-one realtime conversations." },
      { label: "Groups", href: "/dashboard/messenger/groups", description: "Group conversations with your team and clients." },
      { label: "Channels", href: "/dashboard/messenger/channels", description: "Broadcast channels for announcements and updates." },
      { label: "Announcements", href: "/dashboard/messenger/announcements", description: "Company-wide announcements and notices." },
      { label: "Shared Files", href: "/dashboard/messenger/files", description: "Files shared across your conversations." },
      { label: "Starred", href: "/dashboard/messenger/starred", description: "Your starred messages and conversations." },
      { label: "Archive", href: "/dashboard/messenger/archive", description: "Archived conversations and messages." },
    ],
  },
  {
    key: "ai",
    label: "AI & Automation",
    icon: Bot,
    href: "/dashboard/ai",
    crumb: "AI & Automation",
    children: [
      { label: "K2Kai Studio", href: "/dashboard/ai/studio", description: "Create and manage AI agents and prompts." },
      { label: "AI Reply Assistant", href: "/dashboard/ai/reply", description: "AI-suggested replies for your inbox and messages." },
      { label: "Caption Generator", href: "/dashboard/ai/captions", description: "Generate post captions and hashtags with AI." },
      { label: "Workflow Automation", href: "/dashboard/ai/workflows", description: "Build automated workflows and triggers." },
      { label: "Automation Logs", href: "/dashboard/ai/logs", description: "History and status of automated workflows." },
    ],
  },
  {
    key: "insights",
    label: "Insights",
    icon: BarChart3,
    href: "/dashboard/insights",
    crumb: "Insights",
    children: [
      { label: "Analytics", href: "/dashboard/insights/analytics", description: "Unified analytics across all platforms." },
      { label: "Reach", href: "/dashboard/insights/reach", description: "Audience reach and impression metrics." },
      { label: "Engagement", href: "/dashboard/insights/engagement", description: "Engagement rate and interaction analytics." },
      { label: "Audience", href: "/dashboard/insights/audience", description: "Audience demographics and growth." },
      { label: "Reports", href: "/dashboard/insights/reports", description: "Generate and export performance reports." },
      { label: "Live Analytics", href: "/dashboard/insights/live", description: "Real-time analytics as events happen." },
    ],
  },
  {
    key: "executive",
    label: "Executive",
    icon: LayoutDashboard,
    href: "/dashboard/executive",
    crumb: "Executive",
    children: [
      { label: "Overview", href: "/dashboard/executive", description: "Unified CEO / management command center." },
      { label: "Activity Feed", href: "/dashboard/executive/activity-feed", description: "Global enterprise timeline across all modules." },
    ],
  },
  {
    key: "queue",
    label: "Queue Engine",
    icon: Layers,
    href: "/dashboard/queue",
    crumb: "Queue Engine",
    children: [
      { label: "Overview", href: "/dashboard/queue", description: "Real-time BullMQ + Redis queue monitoring." },
      { label: "Jobs", href: "/dashboard/queue/jobs", description: "All job audit records across queues." },
      { label: "Failed Jobs", href: "/dashboard/queue/failed", description: "Recover failed jobs." },
      { label: "Workers", href: "/dashboard/queue/workers", description: "Background worker instances + health." },
      { label: "Queue Health", href: "/dashboard/queue/health", description: "Redis, BullMQ, scheduler and subsystem health." },
    ],
  },
  {
    key: "inbox",
    label: "Inbox",
    icon: Inbox,
    href: "/dashboard/inbox",
    crumb: "Inbox",
    children: [
      { label: "Unified Inbox", href: "/dashboard/inbox/unified", description: "All external messages in one place." },
      { label: "Facebook", href: "/dashboard/inbox/facebook", description: "Facebook messages and comments." },
      { label: "Instagram", href: "/dashboard/inbox/instagram", description: "Instagram messages and comments." },
      { label: "LinkedIn", href: "/dashboard/inbox/linkedin", description: "LinkedIn messages and comments." },
    ],
  },
  {
    key: "media",
    label: "Media Library",
    icon: Images,
    href: "/dashboard/media",
    crumb: "Media Library",
    children: [
      { label: "All Assets", href: "/dashboard/media?view=assets", description: "Browse and manage all digital assets." },
      { label: "Collections", href: "/dashboard/media?view=collections", description: "Organize assets into nested collections." },
      { label: "Tags", href: "/dashboard/media?view=tags", description: "Tag and categorize assets for quick search." },
    ],
  },
  {
    key: "notifications",
    label: "Notifications",
    icon: Bell,
    href: "/dashboard/notifications",
    crumb: "Notification Center",
    expandable: false,
    children: [{ label: "Notification Center", href: "/dashboard/notifications" }],
  },
  {
    key: "admin-workspace",
    label: "Workspace",
    icon: Settings,
    href: "/dashboard/admin",
    crumb: "Workspace",
    expandable: true,
    children: [
      { label: "Administration", href: "/dashboard/admin", description: "Executive administration overview." },
      { label: "Company Settings", href: "/dashboard/admin/company", description: "Company profile and branding configuration." },
      { label: "Workspace Settings", href: "/dashboard/admin/company", description: "Workspace-wide preferences and defaults." },
      { label: "API Connections", href: "/dashboard/admin/api", description: "Manage third-party API integrations." },
    ],
  },
  {
    key: "admin-users",
    label: "Users",
    icon: Users,
    href: "/dashboard/admin/users",
    crumb: "Users",
    expandable: true,
    children: [
      { label: "User Management", href: "/dashboard/admin/users", description: "Manage platform users, access, and invitations." },
      { label: "User Permissions", href: "/dashboard/admin/security/permissions", description: "Role-based permission matrix." },
      { label: "User Activity", href: "/dashboard/team/activity", description: "Team activity and audit timeline." },
      { label: "User Roles", href: "/dashboard/team/roles", description: "Define roles and control what each member can do." },
      { label: "Active Sessions", href: "/dashboard/admin/security/sessions", description: "Live login sessions and devices." },
      { label: "Login History", href: "/dashboard/admin/security/login-history", description: "Authentication attempts." },
    ],
  },
  {
    key: "admin-security",
    label: "Security",
    icon: ShieldCheck,
    href: "/dashboard/admin/security/overview",
    crumb: "Security",
    expandable: true,
    children: [
      { label: "Security Center", href: "/dashboard/admin/security/overview", description: "Enterprise RBAC, audit logs, sessions, and threat monitoring." },
      { label: "Security Events", href: "/dashboard/admin/security/events", description: "Correlated security signals." },
      { label: "API Access", href: "/dashboard/admin/security/api-access", description: "API call logs and latency." },
      { label: "Audit Logs", href: "/dashboard/admin/security/audit", description: "System-wide audit and security logs." },
    ],
  },
  {
    key: "admin-backup",
    label: "Backup",
    icon: Database,
    href: "/dashboard/admin/backup",
    crumb: "Backup",
    expandable: true,
    children: [
      { label: "Backup Center", href: "/dashboard/admin/backup", description: "Enterprise backup & disaster recovery." },
      { label: "Backup Jobs", href: "/dashboard/admin/backup/jobs", description: "Create, verify and restore backups." },
      { label: "Restore Manager", href: "/dashboard/admin/backup/restore", description: "Guided restore wizard." },
      { label: "Recovery Logs", href: "/dashboard/admin/backup/logs", description: "Immutable backup/restore audit." },
      { label: "Schedules", href: "/dashboard/admin/backup/schedule", description: "Automated backup schedules." },
    ],
  },
  {
    key: "admin-localization",
    label: "Localization",
    icon: Globe,
    href: "/dashboard/admin/localization",
    crumb: "Localization",
    expandable: true,
    children: [
      { label: "Localization", href: "/dashboard/admin/localization", description: "Languages, translations and regional settings." },
      { label: "Language Manager", href: "/dashboard/admin/localization/languages", description: "Supported languages and direction." },
      { label: "Translation Center", href: "/dashboard/admin/localization/translations", description: "Coverage, status and missing keys." },
      { label: "Locale Settings", href: "/dashboard/admin/localization/settings", description: "Regional formatting and AI translation." },
    ],
  },
  {
    key: "admin-system",
    label: "System",
    icon: Activity,
    href: "/monitoring",
    crumb: "System",
    expandable: true,
    children: [
      { label: "Monitoring & Health", href: "/monitoring", description: "Enterprise operational command center." },
      { label: "Notifications", href: "/dashboard/admin/notifications", description: "Global notification preferences." },
      { label: "Storage", href: "/dashboard/admin/backup/storage", description: "Capacity & provider monitoring." },
      { label: "PWA Settings", href: "/dashboard/admin/pwa", description: "Install, service worker, cache and update management." },
      { label: "System Health", href: "/monitoring", description: "Servers, queues, and system status." },
    ],
  },
];

/** Flat lookup of every route → its nav meta (for breadcrumbs + page headers). */
export type RouteMeta = {
  href: string;
  label: string;
  description?: string;
  moduleKey: string;
  moduleLabel: string;
  moduleHref: string;
  crumb: string;
};

export const routeMetaMap: Record<string, RouteMeta> = (() => {
  const map: Record<string, RouteMeta> = {};
  for (const section of sidebarConfig) {
    map[section.href] = {
      href: section.href,
      label: section.label,
      moduleKey: section.key,
      moduleLabel: section.label,
      moduleHref: section.href,
      crumb: section.crumb,
    };
    for (const child of section.children) {
      map[child.href] = {
        href: child.href,
        label: child.label,
        description: child.description,
        moduleKey: section.key,
        moduleLabel: section.label,
        moduleHref: section.href,
        crumb: section.crumb,
      };
    }
  }
  return map;
})();

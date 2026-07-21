/**
 * K2KAI Social Flow navigation architecture registry — Blueprint v1.1.
 *
 * This is the single data source for sidebar items, breadcrumbs, permissions,
 * search navigation, canonical destinations, redirects, and route lifecycle.
 * UI code maps `icon` names to Lucide components; no route is duplicated there.
 */

export const NAVIGATION_MODULES = [
  {
    key: "dashboard", label: "Dashboard", icon: "LayoutDashboard", href: "/dashboard", crumb: "Dashboard",
    description: "Enterprise overview of operations, channels, teams, AI, and platform health.", permission: "VIEW_DASHBOARD", expandable: false, children: [],
  },
  {
    key: "social", label: "Social", icon: "Network", href: "/dashboard/social", crumb: "Social",
    description: "Manage connected accounts, schedule content, and monitor engagement across every platform.", permission: "VIEW_SOCIAL",
    children: [
      { label: "Connected Accounts", href: "/dashboard/social/accounts", description: "Connect and manage Facebook, Instagram, LinkedIn and website accounts.", permission: "VIEW_SOCIAL" },
      { label: "Publishing Scheduler", href: "/dashboard/social/publisher", description: "Schedule and publish posts across all connected platforms.", permission: "VIEW_PUBLISHING" },
      { label: "Content Planner", href: "/dashboard/social/planner", description: "Plan and organize content ideas into a calendar.", permission: "VIEW_SCHEDULER" },
      { label: "Engagement Monitor", href: "/dashboard/social/engagement", description: "Monitor likes, comments, and reactions in real time.", permission: "VIEW_SOCIAL" },
    ],
  },
  {
    key: "team", label: "Team", icon: "Users", href: "/dashboard/team", crumb: "Team",
    description: "Manage team members, responsibilities, roles, tasks, and operational activity.", permission: "VIEW_TEAM",
    children: [
      { label: "Members", href: "/dashboard/team/members", description: "Manage team members, profiles, and access.", permission: "VIEW_TEAM" },
      { label: "Roles & Permissions", href: "/dashboard/team/roles", description: "Define roles and control what each member can do.", permission: "MANAGE_ROLES" },
      { label: "Tasks", href: "/dashboard/team/tasks", description: "Assign and track team tasks and routines.", permission: "VIEW_TEAM" },
      { label: "Activity Logs", href: "/dashboard/team/activity", description: "Audit trail of team actions and changes.", permission: "VIEW_TEAM" },
    ],
  },
  {
    key: "messenger", label: "K2 Messenger", icon: "MessageCircle", href: "/dashboard/messenger", crumb: "K2 Messenger",
    description: "Secure internal messaging for direct, group, channel, and announcement conversations.", permission: "VIEW_TEAM",
    children: [
      { label: "Direct Messages", href: "/dashboard/messenger/direct", description: "One-on-one realtime conversations.", permission: "VIEW_TEAM" },
      { label: "Groups", href: "/dashboard/messenger/groups", description: "Group conversations with your team and clients.", permission: "VIEW_TEAM" },
      { label: "Channels", href: "/dashboard/messenger/channels", description: "Broadcast channels for announcements and updates.", permission: "VIEW_TEAM" },
      { label: "Announcements", href: "/dashboard/messenger/announcements", description: "Company-wide announcements and notices.", permission: "VIEW_TEAM" },
      { label: "Shared Files", href: "/dashboard/messenger/files", description: "Files shared across your conversations.", permission: "VIEW_TEAM" },
      { label: "Starred", href: "/dashboard/messenger/starred", description: "Your starred messages and conversations.", permission: "VIEW_TEAM" },
      { label: "Archive", href: "/dashboard/messenger/archive", description: "Archived conversations and messages.", permission: "VIEW_TEAM" },
    ],
  },
  {
    key: "ai", label: "AI & Automation", icon: "Bot", href: "/dashboard/ai", crumb: "AI & Automation",
    description: "Build AI agents, automate replies, and orchestrate workflows across your stack.", permission: "VIEW_AI",
    children: [
      { label: "K2Kai Studio", href: "/dashboard/ai/studio", description: "Create and manage AI agents and prompts.", permission: "VIEW_AI" },
      { label: "Workflow Automation", href: "/dashboard/ai/workflows", description: "Build automated workflows and triggers.", permission: "VIEW_AI" },
    ],
  },
  {
    key: "insights", label: "Insights", icon: "BarChart3", href: "/dashboard/insights", crumb: "Insights",
    description: "Unified analytics, reach, engagement, and audience reporting for all platforms.", permission: "VIEW_ANALYTICS",
    children: [
      { label: "Analytics", href: "/dashboard/insights/analytics", description: "Unified analytics across all platforms.", permission: "VIEW_ANALYTICS" },
      { label: "Reports", href: "/dashboard/insights/reports", description: "Generate and export performance reports.", permission: "VIEW_ANALYTICS" },
    ],
  },
  {
    key: "executive", label: "Executive", icon: "LayoutDashboard", href: "/dashboard/executive", crumb: "Executive",
    description: "Executive intelligence, cross-module performance, and enterprise activity.", permission: "VIEW_ANALYTICS",
    children: [
      { label: "Activity Feed", href: "/dashboard/executive/activity-feed", description: "Global enterprise timeline across all modules.", permission: "VIEW_ANALYTICS" },
    ],
  },
  {
    key: "queue", label: "Queue Engine", icon: "Layers", href: "/dashboard/queue", crumb: "Queue Engine",
    description: "Monitor queued work, workers, failures, retries, and queue infrastructure.", permission: "SOCIAL_CONNECT",
    children: [
      { label: "Jobs", href: "/dashboard/queue/jobs", description: "All job audit records across queues.", permission: "SOCIAL_CONNECT" },
      { label: "Failed Jobs", href: "/dashboard/queue/failed", description: "Recover failed jobs.", permission: "SOCIAL_CONNECT" },
      { label: "Workers", href: "/dashboard/queue/workers", description: "Background worker instances and health.", permission: "SOCIAL_CONNECT" },
      { label: "Queue Health", href: "/dashboard/queue/health", description: "Redis, BullMQ, scheduler and subsystem health.", permission: "SOCIAL_CONNECT" },
    ],
  },
  {
    key: "inbox", label: "Inbox", icon: "Inbox", href: "/dashboard/inbox", crumb: "Inbox",
    description: "All external customer conversations, managed from one unified workspace.", permission: "VIEW_INBOX",
    children: [
      { label: "Unified Inbox", href: "/dashboard/inbox/unified", description: "All external messages and provider filters in one place.", permission: "VIEW_INBOX" },
    ],
  },
  {
    key: "media", label: "Media Library", icon: "Images", href: "/dashboard/media", crumb: "Media Library",
    description: "Manage reusable digital assets, collections, and tags.", permission: "VIEW_MEDIA",
    children: [
      { label: "All Assets", href: "/dashboard/media?view=assets", description: "Browse and manage all digital assets.", permission: "VIEW_MEDIA" },
      { label: "Collections", href: "/dashboard/media?view=collections", description: "Organize assets into nested collections.", permission: "VIEW_MEDIA" },
      { label: "Tags", href: "/dashboard/media?view=tags", description: "Tag and categorize assets for quick search.", permission: "VIEW_MEDIA" },
    ],
  },
  {
    key: "notifications", label: "Notifications", icon: "Bell", href: "/dashboard/notifications", crumb: "Notifications",
    description: "Review and manage enterprise alerts and notifications.", permission: "VIEW_NOTIFICATIONS", expandable: false, children: [],
  },
  {
    key: "admin-workspace", label: "Workspace", icon: "Settings", href: "/dashboard/admin", crumb: "Workspace",
    description: "Configure company identity, workspace preferences, and external API connections.", permission: "VIEW_SETTINGS", expandable: true,
    children: [
      { label: "Company Settings", href: "/dashboard/admin/company", description: "Company profile and branding configuration.", permission: "MANAGE_SETTINGS" },
      { label: "API Connections", href: "/dashboard/admin/api", description: "Manage third-party API integrations.", permission: "SOCIAL_CONNECT" },
    ],
  },
  {
    key: "admin-users", label: "Users", icon: "Users", href: "/dashboard/admin/users", crumb: "Users",
    description: "Manage users, roles, permissions, sessions, and authentication history.", permission: "VIEW_USERS", expandable: true,
    children: [
      { label: "User Permissions", href: "/dashboard/admin/security/permissions", description: "Role-based permission matrix.", permission: "MANAGE_ROLES" },
      { label: "User Activity", href: "/dashboard/admin/users/activity", description: "Per-user login, action, device, and security activity.", permission: "MANAGE_USERS" },
      { label: "User Roles", href: "/dashboard/admin/users/roles", description: "User roles, permissions, assignment and access levels.", permission: "MANAGE_ROLES" },
      { label: "Active Sessions", href: "/dashboard/admin/security/sessions", description: "Live login sessions and devices.", permission: "VIEW_SECURITY" },
      { label: "Login History", href: "/dashboard/admin/security/login-history", description: "Authentication attempts.", permission: "VIEW_SECURITY" },
    ],
  },
  {
    key: "admin-security", label: "Security", icon: "ShieldCheck", href: "/dashboard/admin/security/overview", crumb: "Security",
    description: "Monitor security posture, events, API access, and audit history.", permission: "VIEW_SECURITY", expandable: true,
    children: [
      { label: "Security Events", href: "/dashboard/admin/security/events", description: "Correlated security signals.", permission: "VIEW_SECURITY" },
      { label: "API Access", href: "/dashboard/admin/security/api-access", description: "API call logs and latency.", permission: "VIEW_SECURITY" },
      { label: "Audit Logs", href: "/dashboard/admin/security/audit", description: "System-wide audit and security logs.", permission: "VIEW_SECURITY" },
    ],
  },
  {
    key: "admin-backup", label: "Backup", icon: "Database", href: "/dashboard/admin/backup", crumb: "Backup",
    description: "Manage backup, restore, scheduling, and recovery audit operations.", permission: "VIEW_BACKUP", expandable: true,
    children: [
      { label: "Backup Jobs", href: "/dashboard/admin/backup/jobs", description: "Create, verify and restore backups.", permission: "VIEW_BACKUP" },
      { label: "Restore Manager", href: "/dashboard/admin/backup/restore", description: "Guided restore wizard.", permission: "MANAGE_BACKUP" },
      { label: "Recovery Logs", href: "/dashboard/admin/backup/logs", description: "Immutable backup and restore audit.", permission: "VIEW_BACKUP" },
      { label: "Schedules", href: "/dashboard/admin/backup/schedule", description: "Automated backup schedules.", permission: "MANAGE_BACKUP" },
    ],
  },
  {
    key: "admin-localization", label: "Localization", icon: "Globe", href: "/dashboard/admin/localization", crumb: "Localization",
    description: "Manage languages, translations, and regional formatting.", permission: "VIEW_SETTINGS", expandable: true,
    children: [
      { label: "Language Manager", href: "/dashboard/admin/localization/languages", description: "Supported languages and direction.", permission: "VIEW_SETTINGS" },
      { label: "Translation Center", href: "/dashboard/admin/localization/translations", description: "Coverage, status and missing keys.", permission: "VIEW_SETTINGS" },
      { label: "Locale Settings", href: "/dashboard/admin/localization/settings", description: "Regional formatting and AI translation.", permission: "VIEW_SETTINGS" },
    ],
  },
  {
    key: "admin-system", label: "System", icon: "Activity", href: "/monitoring", crumb: "System",
    description: "Monitor platform health, storage, deployment, and progressive web app state.", permission: "VIEW_SETTINGS", expandable: true,
    children: [
      { label: "Storage", href: "/dashboard/admin/backup/storage", description: "Capacity and provider monitoring.", permission: "VIEW_BACKUP" },
      { label: "PWA Settings", href: "/dashboard/admin/pwa", description: "Install, service worker, cache and update management.", permission: "VIEW_SETTINGS" },
    ],
  },
];

export const ROUTE_REDIRECTS = [
  { source: "/scheduler", destination: "/dashboard/social/publisher", permanent: true },
  { source: "/planner", destination: "/dashboard/social/planner", permanent: true },
  { source: "/content-planner", destination: "/dashboard/social/planner", permanent: true },
  { source: "/social", destination: "/dashboard/social", permanent: true },
  { source: "/engagement", destination: "/dashboard/social/engagement", permanent: true },
  { source: "/automation", destination: "/dashboard/ai/workflows", permanent: true },
  { source: "/ai", destination: "/dashboard/ai/studio", permanent: true },
  { source: "/inbox", destination: "/dashboard/inbox/unified", permanent: true },
  { source: "/messages", destination: "/dashboard/inbox/unified", permanent: true },
  { source: "/duty-routine", destination: "/dashboard/team/tasks", permanent: true },
  { source: "/dashboard/users", destination: "/dashboard/admin/users", permanent: true },
  { source: "/dashboard/settings", destination: "/dashboard/admin/company", permanent: true },
  { source: "/settings/account", destination: "/dashboard/admin/company", permanent: true },
  { source: "/settings/accounts", destination: "/dashboard/admin/api", permanent: true },
  { source: "/settings/social", destination: "/dashboard/social/accounts", permanent: true },
  { source: "/notifications", destination: "/dashboard/notifications", permanent: true },
  { source: "/insights", destination: "/dashboard/insights/analytics", permanent: true },
  { source: "/messenger", destination: "/dashboard/messenger", permanent: true },
  { source: "/groups", destination: "/dashboard/messenger/groups", permanent: true },
  { source: "/channels", destination: "/dashboard/messenger/channels", permanent: true },
  { source: "/announcements", destination: "/dashboard/messenger/announcements", permanent: true },
  { source: "/files", destination: "/dashboard/messenger/files", permanent: true },
  { source: "/starred", destination: "/dashboard/messenger/starred", permanent: true },
  { source: "/archive", destination: "/dashboard/messenger/archive", permanent: true },
  { source: "/dashboard/admin/health", destination: "/monitoring", permanent: true },
  { source: "/dashboard/admin/apis", destination: "/dashboard/admin/api", permanent: true },
  { source: "/dashboard/admin/audit", destination: "/dashboard/admin/security/audit", permanent: true },
  { source: "/dashboard/admin/notifications", destination: "/dashboard/notifications", permanent: true },
  { source: "/dashboard/admin/system-health", destination: "/monitoring", permanent: true },
  { source: "/dashboard/monitoring", destination: "/monitoring", permanent: true },
  { source: "/dashboard/admin/security", destination: "/dashboard/admin/security/overview", permanent: true },
  { source: "/dashboard/insights/dashboard", destination: "/dashboard/insights/analytics", permanent: true },
  { source: "/dashboard/team/duty", destination: "/dashboard/team/tasks", permanent: true },
  { source: "/dashboard/social/scheduler", destination: "/dashboard/social/publisher", permanent: true },
  { source: "/dashboard/social/calendar", destination: "/dashboard/social/planner", permanent: true },
  { source: "/dashboard/social/drafts", destination: "/dashboard/social/planner", permanent: true },
  { source: "/dashboard/social/campaigns", destination: "/dashboard/social/planner", permanent: true },
  { source: "/dashboard/social/comments", destination: "/dashboard/inbox/unified", permanent: true },
  { source: "/dashboard/social/messages", destination: "/dashboard/inbox/unified", permanent: true },
  { source: "/dashboard/ai/reply", destination: "/dashboard/inbox/unified", permanent: true },
  { source: "/dashboard/ai/captions", destination: "/dashboard/ai/studio", permanent: true },
  { source: "/dashboard/ai/logs", destination: "/dashboard/ai/workflows", permanent: true },
  { source: "/dashboard/insights/reach", destination: "/dashboard/insights/analytics", permanent: true },
  { source: "/dashboard/insights/engagement", destination: "/dashboard/insights/analytics", permanent: true },
  { source: "/dashboard/insights/audience", destination: "/dashboard/insights/analytics", permanent: true },
  { source: "/dashboard/insights/live", destination: "/dashboard/insights/analytics", permanent: true },
  { source: "/dashboard/inbox/all", destination: "/dashboard/inbox/unified", permanent: true },
  { source: "/dashboard/inbox/facebook", destination: "/dashboard/inbox/unified", permanent: true },
  { source: "/dashboard/inbox/instagram", destination: "/dashboard/inbox/unified", permanent: true },
  { source: "/dashboard/inbox/linkedin", destination: "/dashboard/inbox/unified", permanent: true },
  { source: "/ceo", destination: "/dashboard/executive", permanent: true },
  { source: "/publishing", destination: "/dashboard/social/publisher", permanent: true },
];

export const INTERNAL_ROUTES = [
  { route: "/", purpose: "Public entry" },
  { route: "/login", purpose: "Authentication" },
  { route: "/unauthorized", purpose: "Authorization failure" },
  { route: "/offline", purpose: "PWA offline fallback" },
  { route: "/api/**", purpose: "Authenticated or explicitly public internal API surface" },
];

export const REMOVED_ROUTES = [
  { route: "/dashboard/social/facebook", reason: "Obsolete Facebook Live sidebar/page removed for Blueprint v1.1." },
  { route: "/dashboard/[module]/[...slug]", reason: "Generic placeholder catch-all removed; unknown dashboard paths now return 404." },
];

export const DEPRECATED_ROUTES = [];

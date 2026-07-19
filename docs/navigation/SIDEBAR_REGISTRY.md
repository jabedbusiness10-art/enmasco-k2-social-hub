# Canonical Sidebar Registry

Status: verified for TASK-77 route governance.

This document is generated from and governed by `navigation/sidebarConfig.ts`. A main button and a sub-button are both route-bearing items. Each label and full `href` must be unique. Query-string views are distinct canonical destinations only when they are backed by the same dedicated page. The generic dashboard catch-all is not accepted as proof that a sidebar route exists.

## Registry rules

- One visible item equals one canonical route.
- Main buttons open their canonical page; expandable main buttons also toggle their submenu.
- Sidebar labels and canonical `href` values are globally unique.
- Search navigation may reference only routes in this registry and must use the same label.
- Every canonical target must have a dedicated `page.tsx`; placeholder catch-all pages are rejected.
- Legacy URLs may exist only as unique, terminal permanent redirects to a real page.
- Every concrete dashboard page must be canonical or explicitly registered as a compatibility destination.

## Canonical routes

### Dashboard

- **Dashboard** (main) — `/dashboard`

### Social

- **Social** (main) — `/dashboard/social`
- **Connected Accounts** — `/dashboard/social/accounts`
- **Publishing Scheduler** — `/dashboard/social/publisher`
- **Content Planner** — `/dashboard/social/planner`
- **Engagement Monitor** — `/dashboard/social/engagement`
- **Facebook Live** — `/dashboard/social/facebook`

### Team

- **Team** (main) — `/dashboard/team`
- **Members** — `/dashboard/team/members`
- **Roles & Permissions** — `/dashboard/team/roles`
- **Tasks** — `/dashboard/team/tasks`
- **Activity Logs** — `/dashboard/team/activity`

### K2 Messenger

- **K2 Messenger** (main) — `/dashboard/messenger`
- **Direct Messages** — `/dashboard/messenger/direct`
- **Groups** — `/dashboard/messenger/groups`
- **Channels** — `/dashboard/messenger/channels`
- **Announcements** — `/dashboard/messenger/announcements`
- **Shared Files** — `/dashboard/messenger/files`
- **Starred** — `/dashboard/messenger/starred`
- **Archive** — `/dashboard/messenger/archive`

### AI & Automation

- **AI & Automation** (main) — `/dashboard/ai`
- **K2Kai Studio** — `/dashboard/ai/studio`
- **Workflow Automation** — `/dashboard/ai/workflows`

### Insights

- **Insights** (main) — `/dashboard/insights`
- **Analytics** — `/dashboard/insights/analytics`
- **Reports** — `/dashboard/insights/reports`

### Executive

- **Executive** (main) — `/dashboard/executive`
- **Activity Feed** — `/dashboard/executive/activity-feed`

### Queue Engine

- **Queue Engine** (main) — `/dashboard/queue`
- **Jobs** — `/dashboard/queue/jobs`
- **Failed Jobs** — `/dashboard/queue/failed`
- **Workers** — `/dashboard/queue/workers`
- **Queue Health** — `/dashboard/queue/health`

### Inbox

- **Inbox** (main) — `/dashboard/inbox`
- **Unified Inbox** — `/dashboard/inbox/unified`

### Media Library

- **Media Library** (main) — `/dashboard/media`
- **All Assets** — `/dashboard/media?view=assets`
- **Collections** — `/dashboard/media?view=collections`
- **Tags** — `/dashboard/media?view=tags`

### Notifications

- **Notifications** (main) — `/dashboard/notifications`

### Workspace

- **Workspace** (main) — `/dashboard/admin`
- **Company Settings** — `/dashboard/admin/company`
- **API Connections** — `/dashboard/admin/api`

### Users

- **Users** (main) — `/dashboard/admin/users`
- **User Permissions** — `/dashboard/admin/security/permissions`
- **User Activity** — `/dashboard/admin/users/activity`
- **User Roles** — `/dashboard/admin/users/roles`
- **Active Sessions** — `/dashboard/admin/security/sessions`
- **Login History** — `/dashboard/admin/security/login-history`

### Security

- **Security** (main) — `/dashboard/admin/security/overview`
- **Security Events** — `/dashboard/admin/security/events`
- **API Access** — `/dashboard/admin/security/api-access`
- **Audit Logs** — `/dashboard/admin/security/audit`

### Backup

- **Backup** (main) — `/dashboard/admin/backup`
- **Backup Jobs** — `/dashboard/admin/backup/jobs`
- **Restore Manager** — `/dashboard/admin/backup/restore`
- **Recovery Logs** — `/dashboard/admin/backup/logs`
- **Schedules** — `/dashboard/admin/backup/schedule`

### Localization

- **Localization** (main) — `/dashboard/admin/localization`
- **Language Manager** — `/dashboard/admin/localization/languages`
- **Translation Center** — `/dashboard/admin/localization/translations`
- **Locale Settings** — `/dashboard/admin/localization/settings`

### System

- **System** (main) — `/monitoring`
- **Storage** — `/dashboard/admin/backup/storage`
- **PWA Settings** — `/dashboard/admin/pwa`

## Retired duplicate and placeholder destinations

Old bookmarks remain safe through permanent redirects:

| Retired URL | Canonical destination |
|---|---|
| `/dashboard/admin/audit` | `/dashboard/admin/security/audit` |
| `/dashboard/admin/health` | `/monitoring` |
| `/dashboard/admin/notifications` | `/dashboard/notifications` |
| `/dashboard/admin/system-health` | `/monitoring` |
| `/dashboard/monitoring` | `/monitoring` |
| `/dashboard/social/calendar` | `/dashboard/social/planner` |
| `/dashboard/social/drafts` | `/dashboard/social/planner` |
| `/dashboard/social/campaigns` | `/dashboard/social/planner` |
| `/dashboard/social/comments` | `/dashboard/inbox/unified` |
| `/dashboard/social/messages` | `/dashboard/inbox/unified` |
| `/dashboard/ai/reply` | `/dashboard/inbox/unified` |
| `/dashboard/ai/captions` | `/dashboard/ai/studio` |
| `/dashboard/ai/logs` | `/dashboard/ai/workflows` |
| `/dashboard/insights/reach` | `/dashboard/insights/analytics` |
| `/dashboard/insights/engagement` | `/dashboard/insights/analytics` |
| `/dashboard/insights/audience` | `/dashboard/insights/analytics` |
| `/dashboard/insights/live` | `/dashboard/insights/analytics` |

## Verification command

```powershell
npm.cmd run test:sidebar
```

The command fails on any duplicate key, duplicate label, duplicate canonical route, inconsistent search name, placeholder-only target, redirect collision, redirect chain, missing destination, or unregistered concrete dashboard page.

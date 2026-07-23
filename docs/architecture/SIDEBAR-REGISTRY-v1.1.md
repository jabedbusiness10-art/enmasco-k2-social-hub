# K2KAI Social Flow — Sidebar & Route Registry v1.1

> Generated from `navigation/registry.mjs`. Do not maintain route tables by hand.

Status: **FROZEN — Enterprise Blueprint v1.1**

## Governance

- `navigation/registry.mjs` is the single source for canonical routes, sidebar labels, permissions, breadcrumbs, redirects, and lifecycle status.
- `navigation/sidebarConfig.ts` only maps registry icon names to Lucide components and builds route metadata.
- Sidebar, active state, breadcrumbs, module landings, search navigation, and Next.js redirects consume the registry.
- Every canonical sidebar target has a dedicated `page.tsx`; the generic dashboard placeholder catch-all was removed.
- All `/dashboard/**` pages and `/monitoring` are authenticated by middleware. Admin, Executive, and report routes retain their existing role guards. API permission checks remain owned by their existing `requirePermission` guards.
- Provider APIs are INTERNAL and are not sidebar destinations. The internal `/api/social/facebook/live` integration endpoint is intentionally preserved; the obsolete Facebook Live UI route is removed.

## Registry totals

| Classification | Total |
|---|---:|
| Main modules | 17 |
| Submenu items | 47 |
| Total sidebar items | 64 |
| ACTIVE canonical routes | 64 |
| REDIRECT routes | 52 |
| DEPRECATED routes | 0 |
| INTERNAL route groups | 5 |
| REMOVED route patterns | 2 |

## Canonical sidebar registry

### 1. Dashboard

| Item | Kind | Canonical route | Permission | Breadcrumb |
|---|---|---|---|---|
| Dashboard | Main | `/dashboard` | `VIEW_DASHBOARD` | Dashboard |

### 2. Social

| Item | Kind | Canonical route | Permission | Breadcrumb |
|---|---|---|---|---|
| Social | Main | `/dashboard/social` | `VIEW_SOCIAL` | Dashboard > Social |
| Connected Accounts | Submenu | `/dashboard/social/accounts` | `VIEW_SOCIAL` | Dashboard > Social > Connected Accounts |
| Publishing Scheduler | Submenu | `/dashboard/social/publisher` | `VIEW_PUBLISHING` | Dashboard > Social > Publishing Scheduler |
| Content Planner | Submenu | `/dashboard/social/planner` | `VIEW_SCHEDULER` | Dashboard > Social > Content Planner |
| Engagement Monitor | Submenu | `/dashboard/social/engagement` | `VIEW_SOCIAL` | Dashboard > Social > Engagement Monitor |

### 3. Team

| Item | Kind | Canonical route | Permission | Breadcrumb |
|---|---|---|---|---|
| Team | Main | `/dashboard/team` | `VIEW_TEAM` | Dashboard > Team |
| Members | Submenu | `/dashboard/team/members` | `VIEW_TEAM` | Dashboard > Team > Members |
| Roles & Permissions | Submenu | `/dashboard/team/roles` | `MANAGE_ROLES` | Dashboard > Team > Roles & Permissions |
| Tasks | Submenu | `/dashboard/team/tasks` | `VIEW_TEAM` | Dashboard > Team > Tasks |
| Activity Logs | Submenu | `/dashboard/team/activity` | `VIEW_TEAM` | Dashboard > Team > Activity Logs |

### 4. K2 Messenger

| Item | Kind | Canonical route | Permission | Breadcrumb |
|---|---|---|---|---|
| K2 Messenger | Main | `/dashboard/messenger` | `VIEW_TEAM` | Dashboard > K2 Messenger |
| Direct Messages | Submenu | `/dashboard/messenger/direct` | `VIEW_TEAM` | Dashboard > K2 Messenger > Direct Messages |
| Groups | Submenu | `/dashboard/messenger/groups` | `VIEW_TEAM` | Dashboard > K2 Messenger > Groups |
| Channels | Submenu | `/dashboard/messenger/channels` | `VIEW_TEAM` | Dashboard > K2 Messenger > Channels |
| Announcements | Submenu | `/dashboard/messenger/announcements` | `VIEW_TEAM` | Dashboard > K2 Messenger > Announcements |
| Shared Files | Submenu | `/dashboard/messenger/files` | `VIEW_TEAM` | Dashboard > K2 Messenger > Shared Files |
| Starred | Submenu | `/dashboard/messenger/starred` | `VIEW_TEAM` | Dashboard > K2 Messenger > Starred |
| Archive | Submenu | `/dashboard/messenger/archive` | `VIEW_TEAM` | Dashboard > K2 Messenger > Archive |

### 5. AI & Automation

| Item | Kind | Canonical route | Permission | Breadcrumb |
|---|---|---|---|---|
| AI & Automation | Main | `/dashboard/ai` | `VIEW_AI` | Dashboard > AI & Automation |
| K2Kai Studio | Submenu | `/dashboard/ai/studio` | `VIEW_AI` | Dashboard > AI & Automation > K2Kai Studio |
| Workflow Automation | Submenu | `/dashboard/ai/workflows` | `VIEW_AI` | Dashboard > AI & Automation > Workflow Automation |

### 6. Insights

| Item | Kind | Canonical route | Permission | Breadcrumb |
|---|---|---|---|---|
| Insights | Main | `/dashboard/insights` | `VIEW_ANALYTICS` | Dashboard > Insights |
| Analytics | Submenu | `/dashboard/insights/analytics` | `VIEW_ANALYTICS` | Dashboard > Insights > Analytics |
| Reports | Submenu | `/dashboard/insights/reports` | `VIEW_ANALYTICS` | Dashboard > Insights > Reports |

### 7. Executive

| Item | Kind | Canonical route | Permission | Breadcrumb |
|---|---|---|---|---|
| Executive | Main | `/dashboard/executive` | `VIEW_ANALYTICS` | Dashboard > Executive |
| Activity Feed | Submenu | `/dashboard/executive/activity-feed` | `VIEW_ANALYTICS` | Dashboard > Executive > Activity Feed |

### 8. Queue Engine

| Item | Kind | Canonical route | Permission | Breadcrumb |
|---|---|---|---|---|
| Queue Engine | Main | `/dashboard/queue` | `SOCIAL_CONNECT` | Dashboard > Queue Engine |
| Jobs | Submenu | `/dashboard/queue/jobs` | `SOCIAL_CONNECT` | Dashboard > Queue Engine > Jobs |
| Failed Jobs | Submenu | `/dashboard/queue/failed` | `SOCIAL_CONNECT` | Dashboard > Queue Engine > Failed Jobs |
| Workers | Submenu | `/dashboard/queue/workers` | `SOCIAL_CONNECT` | Dashboard > Queue Engine > Workers |
| Queue Health | Submenu | `/dashboard/queue/health` | `SOCIAL_CONNECT` | Dashboard > Queue Engine > Queue Health |

### 9. Inbox

| Item | Kind | Canonical route | Permission | Breadcrumb |
|---|---|---|---|---|
| Inbox | Main | `/dashboard/inbox` | `VIEW_INBOX` | Dashboard > Inbox |
| Unified Inbox | Submenu | `/dashboard/inbox/unified` | `VIEW_INBOX` | Dashboard > Inbox > Unified Inbox |

### 10. Media Library

| Item | Kind | Canonical route | Permission | Breadcrumb |
|---|---|---|---|---|
| Media Library | Main | `/dashboard/media` | `VIEW_MEDIA` | Dashboard > Media Library |
| All Assets | Submenu | `/dashboard/media?view=assets` | `VIEW_MEDIA` | Dashboard > Media Library > All Assets |
| Collections | Submenu | `/dashboard/media?view=collections` | `VIEW_MEDIA` | Dashboard > Media Library > Collections |
| Tags | Submenu | `/dashboard/media?view=tags` | `VIEW_MEDIA` | Dashboard > Media Library > Tags |

### 11. Notifications

| Item | Kind | Canonical route | Permission | Breadcrumb |
|---|---|---|---|---|
| Notifications | Main | `/dashboard/notifications` | `VIEW_NOTIFICATIONS` | Dashboard > Notifications |

### 12. Workspace

| Item | Kind | Canonical route | Permission | Breadcrumb |
|---|---|---|---|---|
| Workspace | Main | `/dashboard/admin` | `VIEW_SETTINGS` | Dashboard > Workspace |
| Company Settings | Submenu | `/dashboard/admin/company` | `MANAGE_SETTINGS` | Dashboard > Workspace > Company Settings |
| API Connections | Submenu | `/dashboard/admin/api` | `SOCIAL_CONNECT` | Dashboard > Workspace > API Connections |

### 13. Users

| Item | Kind | Canonical route | Permission | Breadcrumb |
|---|---|---|---|---|
| Users | Main | `/dashboard/admin/users` | `VIEW_USERS` | Dashboard > Users |
| User Permissions | Submenu | `/dashboard/admin/security/permissions` | `MANAGE_ROLES` | Dashboard > Users > User Permissions |
| User Activity | Submenu | `/dashboard/admin/users/activity` | `MANAGE_USERS` | Dashboard > Users > User Activity |
| User Roles | Submenu | `/dashboard/admin/users/roles` | `MANAGE_ROLES` | Dashboard > Users > User Roles |
| Active Sessions | Submenu | `/dashboard/admin/security/sessions` | `VIEW_SECURITY` | Dashboard > Users > Active Sessions |
| Login History | Submenu | `/dashboard/admin/security/login-history` | `VIEW_SECURITY` | Dashboard > Users > Login History |

### 14. Security

| Item | Kind | Canonical route | Permission | Breadcrumb |
|---|---|---|---|---|
| Security | Main | `/dashboard/admin/security/overview` | `VIEW_SECURITY` | Dashboard > Security |
| Security Events | Submenu | `/dashboard/admin/security/events` | `VIEW_SECURITY` | Dashboard > Security > Security Events |
| API Access | Submenu | `/dashboard/admin/security/api-access` | `VIEW_SECURITY` | Dashboard > Security > API Access |
| Audit Logs | Submenu | `/dashboard/admin/security/audit` | `VIEW_SECURITY` | Dashboard > Security > Audit Logs |

### 15. Backup

| Item | Kind | Canonical route | Permission | Breadcrumb |
|---|---|---|---|---|
| Backup | Main | `/dashboard/admin/backup` | `VIEW_BACKUP` | Dashboard > Backup |
| Backup Jobs | Submenu | `/dashboard/admin/backup/jobs` | `VIEW_BACKUP` | Dashboard > Backup > Backup Jobs |
| Restore Manager | Submenu | `/dashboard/admin/backup/restore` | `MANAGE_BACKUP` | Dashboard > Backup > Restore Manager |
| Recovery Logs | Submenu | `/dashboard/admin/backup/logs` | `VIEW_BACKUP` | Dashboard > Backup > Recovery Logs |
| Schedules | Submenu | `/dashboard/admin/backup/schedule` | `MANAGE_BACKUP` | Dashboard > Backup > Schedules |

### 16. Localization

| Item | Kind | Canonical route | Permission | Breadcrumb |
|---|---|---|---|---|
| Localization | Main | `/dashboard/admin/localization` | `VIEW_SETTINGS` | Dashboard > Localization |
| Language Manager | Submenu | `/dashboard/admin/localization/languages` | `VIEW_SETTINGS` | Dashboard > Localization > Language Manager |
| Translation Center | Submenu | `/dashboard/admin/localization/translations` | `VIEW_SETTINGS` | Dashboard > Localization > Translation Center |
| Locale Settings | Submenu | `/dashboard/admin/localization/settings` | `VIEW_SETTINGS` | Dashboard > Localization > Locale Settings |

### 17. System

| Item | Kind | Canonical route | Permission | Breadcrumb |
|---|---|---|---|---|
| System | Main | `/monitoring` | `VIEW_SETTINGS` | Dashboard > System |
| Storage | Submenu | `/dashboard/admin/backup/storage` | `VIEW_BACKUP` | Dashboard > System > Storage |
| PWA Settings | Submenu | `/dashboard/admin/pwa` | `VIEW_SETTINGS` | Dashboard > System > PWA Settings |

## Redirect registry

Every legacy alias is a single permanent redirect to an ACTIVE canonical route. Redirect chains are prohibited.

| Legacy source | Canonical destination | Status |
|---|---|---|
| `/scheduler` | `/dashboard/social/publisher` | REDIRECT |
| `/planner` | `/dashboard/social/planner` | REDIRECT |
| `/content-planner` | `/dashboard/social/planner` | REDIRECT |
| `/social` | `/dashboard/social` | REDIRECT |
| `/engagement` | `/dashboard/social/engagement` | REDIRECT |
| `/automation` | `/dashboard/ai/workflows` | REDIRECT |
| `/ai` | `/dashboard/ai/studio` | REDIRECT |
| `/inbox` | `/dashboard/inbox/unified` | REDIRECT |
| `/messages` | `/dashboard/inbox/unified` | REDIRECT |
| `/duty-routine` | `/dashboard/team/tasks` | REDIRECT |
| `/dashboard/users` | `/dashboard/admin/users` | REDIRECT |
| `/dashboard/settings` | `/dashboard/admin/company` | REDIRECT |
| `/settings/account` | `/dashboard/admin/company` | REDIRECT |
| `/settings/accounts` | `/dashboard/admin/api` | REDIRECT |
| `/settings/social` | `/dashboard/social/accounts` | REDIRECT |
| `/notifications` | `/dashboard/notifications` | REDIRECT |
| `/insights` | `/dashboard/insights/analytics` | REDIRECT |
| `/messenger` | `/dashboard/messenger` | REDIRECT |
| `/groups` | `/dashboard/messenger/groups` | REDIRECT |
| `/channels` | `/dashboard/messenger/channels` | REDIRECT |
| `/announcements` | `/dashboard/messenger/announcements` | REDIRECT |
| `/files` | `/dashboard/messenger/files` | REDIRECT |
| `/starred` | `/dashboard/messenger/starred` | REDIRECT |
| `/archive` | `/dashboard/messenger/archive` | REDIRECT |
| `/dashboard/admin/health` | `/monitoring` | REDIRECT |
| `/dashboard/admin/apis` | `/dashboard/admin/api` | REDIRECT |
| `/dashboard/admin/audit` | `/dashboard/admin/security/audit` | REDIRECT |
| `/dashboard/admin/notifications` | `/dashboard/notifications` | REDIRECT |
| `/dashboard/admin/system-health` | `/monitoring` | REDIRECT |
| `/dashboard/monitoring` | `/monitoring` | REDIRECT |
| `/dashboard/admin/security` | `/dashboard/admin/security/overview` | REDIRECT |
| `/dashboard/insights/dashboard` | `/dashboard/insights/analytics` | REDIRECT |
| `/dashboard/team/duty` | `/dashboard/team/tasks` | REDIRECT |
| `/dashboard/social/scheduler` | `/dashboard/social/publisher` | REDIRECT |
| `/dashboard/social/calendar` | `/dashboard/social/planner` | REDIRECT |
| `/dashboard/social/drafts` | `/dashboard/social/planner` | REDIRECT |
| `/dashboard/social/campaigns` | `/dashboard/social/planner` | REDIRECT |
| `/dashboard/social/comments` | `/dashboard/inbox/unified` | REDIRECT |
| `/dashboard/social/messages` | `/dashboard/inbox/unified` | REDIRECT |
| `/dashboard/ai/reply` | `/dashboard/inbox/unified` | REDIRECT |
| `/dashboard/ai/captions` | `/dashboard/ai/studio` | REDIRECT |
| `/dashboard/ai/logs` | `/dashboard/ai/workflows` | REDIRECT |
| `/dashboard/insights/reach` | `/dashboard/insights/analytics` | REDIRECT |
| `/dashboard/insights/engagement` | `/dashboard/insights/analytics` | REDIRECT |
| `/dashboard/insights/audience` | `/dashboard/insights/analytics` | REDIRECT |
| `/dashboard/insights/live` | `/dashboard/insights/analytics` | REDIRECT |
| `/dashboard/inbox/all` | `/dashboard/inbox/unified` | REDIRECT |
| `/dashboard/inbox/facebook` | `/dashboard/inbox/unified` | REDIRECT |
| `/dashboard/inbox/instagram` | `/dashboard/inbox/unified` | REDIRECT |
| `/dashboard/inbox/linkedin` | `/dashboard/inbox/unified` | REDIRECT |
| `/ceo` | `/dashboard/executive` | REDIRECT |
| `/publishing` | `/dashboard/social/publisher` | REDIRECT |

## Deprecated routes

None. Legacy URLs redirect immediately; no deprecated page remains live.

## Removed routes and pages

| Route | Status | Reason |
|---|---|---|
| `/dashboard/social/facebook` | REMOVED | Obsolete Facebook Live sidebar/page removed for Blueprint v1.1. |
| `/dashboard/[module]/[...slug]` | REMOVED | Generic placeholder catch-all removed; unknown dashboard paths now return 404. |
| `/ceo` page component | REMOVED PAGE | Duplicate page removed; URL redirects to `/dashboard/executive`. |
| `/publishing` page component | REMOVED PAGE | Duplicate page removed; URL redirects to `/dashboard/social/publisher`. |
| `/dashboard/admin/security` page component | REMOVED PAGE | Orphan Account Settings page removed; URL redirects to Security Overview. |

## Internal routes

| Route/group | Purpose | Classification |
|---|---|---|
| `/` | Public entry | INTERNAL |
| `/login` | Authentication | INTERNAL |
| `/unauthorized` | Authorization failure | INTERNAL |
| `/offline` | PWA offline fallback | INTERNAL |
| `/api/**` | Authenticated or explicitly public internal API surface | INTERNAL |

## Inbox architecture

- `/dashboard/inbox/unified` is the only provider-facing Inbox page.
- Facebook, Instagram, and LinkedIn legacy Inbox URLs permanently redirect to Unified Inbox.
- Facebook, Instagram, LinkedIn, TikTok, YouTube, Website, and WhatsApp filtering remains inside Unified Inbox.

## Canonical duplicate resolutions

| Duplicate/inconsistent destination | Resolution |
|---|---|
| Monitoring / System Health | Canonicalized as **System** at `/monitoring`. |
| Company Settings / Workspace Settings / Account Settings | Canonical workspace configuration is **Company Settings** at `/dashboard/admin/company`. |
| Legacy CEO page | Canonicalized as **Executive** at `/dashboard/executive`. |
| Legacy Publishing page | Canonicalized as **Publishing Scheduler** at `/dashboard/social/publisher`. |
| Provider-specific Inbox pages | Canonicalized as **Unified Inbox** at `/dashboard/inbox/unified`. |
| Facebook Live | Removed without replacement. |

## Verification

```powershell
npm.cmd run test:sidebar
npx.cmd tsx --test tests/task77c/*.test.ts
npx.cmd tsc --noEmit
npm.cmd run build
```

The sidebar test fails on duplicate keys, labels, routes, missing pages, missing permissions, missing breadcrumbs, hardcoded redirect duplication, redirect chains, redirect pages, orphan dashboard pages, placeholder catch-all pages, or reintroduced Facebook Live navigation.


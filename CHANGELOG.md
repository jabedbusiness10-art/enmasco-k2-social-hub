# Changelog

All notable changes to K2KAI Social Flow are documented here.
This project adheres to semantic versioning. Launch Candidate entries use the
`v1.0.0-rcN` scheme.

---

## [v1.0.0-rc1] — 2026-07-16

### Added
- **Executive Administration Overview (TASK-65.5):** KPI cards, security
  overview, system status, recent audit logs, backup summary, and quick admin
  actions — all sourced from existing live APIs.
- **Administration Navigation Refactor (TASK-66A):** the Administration sidebar
  is now 6 collapsible groups (Workspace, Users, Security, Backup, Localization,
  System) using the existing collapsible sidebar component.
- **Final UI/UX Polish & Launch Candidate (TASK-66):** dead-link resolution,
  consistency pass, production-readiness verification.

### Changed
- Repointed 5 previously-dead sidebar navigation links to real existing pages
  (Workspace Settings, User Management, Users group header, System Health,
  Monitoring & Health) so the navigation has zero broken links.
- Normalized enterprise spacing, card, button, table, and animation polish
  across modules (visual consistency only — no behavior change).

### Fixed
- Resolved stale `.next` build collision that produced a `Cannot find module`
  error during overlapping dev/build runs.
- Removed dead navigation hrefs that pointed to non-existent admin pages.

### Verified
- `npx tsc --noEmit` → 0 errors.
- `npm run build` → exit 0, clean, no warnings.
- Protected routes → 307 (auth redirect); public routes → 200; key APIs → 401.
- No runtime errors in production server log.

### Known Issues
- No ESLint config in repo (build lint skipped by design).
- Some sidebar tab sub-routes are client-routed tabs (parent pages exist).
- Redis/BullMQ runs in DB-fallback mode without Redis; AI uses demo provider
  without an API key; social APIs require real OAuth credentials.

### Breaking Changes
- **None.**

---

## Pre-RC Module History (summary)

| Task | Module |
|------|--------|
| TASK-51 | Real Analytics API |
| TASK-52 | K2Kai AI Studio |
| TASK-54 / TASK-55 | Media Manager + Collections/Tags |
| TASK-57 | BullMQ + Redis Queue Engine |
| TASK-58 | Executive Intelligence Dashboard |
| TASK-58.5 | Enterprise Navigation & IA Cleanup |
| TASK-59 | Production Deployment + middleware 401 fix |
| TASK-60 | Monitoring & Health Dashboard |
| TASK-60.5 | Quick Actions / Duty Routine repair |
| TASK-61 | Global Search & AI Command Palette |
| TASK-62 | Enterprise Security Audit & RBAC |
| TASK-63 | Enterprise Backup & Disaster Recovery |
| TASK-64 | Enterprise PWA |
| TASK-65 | Multi-Language & AI Auto Translation |

---

[Unreleased]: to be documented in future releases.

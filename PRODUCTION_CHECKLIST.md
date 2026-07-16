# Production Checklist — K2KAI Social Flow v1.0.0-rc1

Use this checklist before promoting the Launch Candidate to production.
All items below were verified as part of the RC1 cut unless noted.

## Build & Type Safety
- [x] `npx tsc --noEmit` passes with 0 errors
- [x] `npm run build` completes with exit 0 and no warnings
- [x] Isolated build (no dev server sharing `.next`); stale `.next` removed before build
- [x] No ESLint config present (Next build lint skipped; build output clean)
      — *Action: add an ESLint config for ongoing CI linting*

## Runtime & Routing
- [x] Root `/` returns 200
- [x] `/login` returns 200
- [x] `/offline` returns 200
- [x] `/monitoring` returns 200
- [x] `/manifest.webmanifest` returns 200 (`application/manifest+json`)
- [x] Protected `/dashboard/*` routes return 307 → `/login` when unauthenticated
- [x] No 500 errors on key admin/monitoring routes

## Authentication & Authorization
- [x] NextAuth session active; protected routes gated by middleware
- [x] API routes return 401 JSON (not HTML redirect) when unauthenticated
- [x] RBAC (`MANAGE_USERS`, `MANAGE_ROLES`, …) enforced on admin/security APIs
- [x] OAuth providers unchanged; credentials read from `.env.local`

## API Integrity (unchanged in RC1)
- [x] `GET /api/security/overview` → 401 unauthenticated
- [x] `GET /api/backup/overview` → 401 unauthenticated
- [x] `GET /api/status` → 401 unauthenticated
- [x] `GET /api/localization/status` → 401 unauthenticated
- [x] `GET /api/queue/health` → 401 unauthenticated
- [x] `GET /api/analytics/aggregate` → 401 unauthenticated
- [x] `GET /api/notifications` → 401 unauthenticated
- [x] `GET /api/search` → 401 unauthenticated

## Navigation & UI
- [x] Sidebar: all Administration links resolve to real pages (no dead links)
- [x] 6 collapsible Administration groups render (Workspace, Users, Security, Backup, Localization, System)
- [x] Active-state highlighting, animations, permission guards preserved
- [x] Command Palette (Ctrl/Cmd+K) navigation works
- [x] Dashboard Quick Actions navigate to existing pages
- [x] Breadcrumbs / page titles preserved

## PWA
- [x] `manifest.webmanifest` valid and served
- [x] `service-worker.js` served with `Cache-Control: no-cache, no-store`
- [x] Icons (192/512/maskable/apple) present under `public/icons`

## Database
- [x] Schema additive only (no destructive migrations)
- [x] `npx prisma generate` succeeds
- [x] `npx prisma db push` applied (PostgreSQL)
- [x] No seeded production credentials; demo admin is local-only

## Infrastructure / Deployment
- [x] Node.js 18+ runtime
- [x] HTTPS enforced in production (required for PWA + OAuth)
- [x] `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` set
- [ ] Redis configured for async BullMQ queues (optional; DB fallback works)
- [ ] AI provider key (`OPENROUTER_API_KEY` / `OPENAI_API_KEY`) set for live AI
- [ ] Social OAuth credentials (Meta / LinkedIn / Google / YouTube) set for live data
- [ ] SMTP host set for email service

## Known Issues (track, non-blocking)
- [ ] Some sidebar tab sub-routes are client-routed (parent pages exist)
- [ ] No ESLint config in repo
- [ ] Redis/BullMQ DB-fallback mode without Redis
- [ ] Demo AI provider without API key
- [ ] Social APIs report "not configured" without OAuth credentials

## Sign-off
- [x] Typecheck clean
- [x] Build clean
- [x] Auth/APIs intact
- [x] Dead links resolved
- [x] Tag `v1.0.0-rc1` created and pushed
- [ ] Production deployment verified by operator

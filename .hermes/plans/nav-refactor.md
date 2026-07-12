# TASK: K2KAI Social Flow — Navigation Architecture Refactor

HIGH PRIORITY. UI/theme/design unchanged. ONLY routing + navigation architecture.

## Target structure (from spec)
- /dashboard (overview)
- /dashboard/social (+ /accounts /scheduler /planner /drafts /campaigns /calendar /engagement /comments)
- /dashboard/messenger (+ /direct /groups /channels /announcements /files /starred /archive)
- /dashboard/team (+ /members /roles /duty /activity)
- /dashboard/ai (+ /studio /reply /captions /workflows /logs)
- /dashboard/insights (+ /dashboard /reach /engagement /audience /reports /live)
- /dashboard/inbox (+ /all /facebook /instagram /linkedin /website)
- /dashboard/admin (+ /company /workspace /apis /security /audit /notifications /backup /health)

## Strategy
- sidebarConfig.ts → new routes + breadcrumb metadata (depth, sectionKey, module).
- Reorganize app/ under /dashboard/* (move existing pages, keep dedicated components).
- New generic /dashboard/[module]/[...slug] page renders PageHeader+Breadcrumb+EmptyState/Loading/Error from route meta (kept minimal, enterprise look, no design change).
- Redirects (next.config) for old top-level routes → new /dashboard/* so no dead links.
- Breadcrumb component reads sidebarConfig by pathname.

## Files
- navigation/sidebarConfig.ts (rewrite)
- components/layout/Breadcrumb.tsx (new)
- components/layout/PageHeader.tsx (new, generic: title/subtitle/breadcrumb/actions)
- app/dashboard/[module]/[...slug]/page.tsx (new generic page)
- move: app/{scheduler,planner,content-planner,media,engagement,automation,ai,social,messages,duty-routine,settings,ceo,notifications,insights/*,inbox,messenger/*,groups,channels,announcements,files,starred,archive,dashboard/users,dashboard/settings} → app/dashboard/*
- next.config.* → redirects
- verify all routes with curl
- git: branch feature/nav-refactor, commit, push, merge to main

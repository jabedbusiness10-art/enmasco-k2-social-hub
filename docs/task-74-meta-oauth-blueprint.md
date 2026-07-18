# TASK-74 — Meta OAuth Integration Blueprint (APPROVED AUDIT)

> Status: **APPROVED, NOT YET IMPLEMENTED.** This document is the implementation
> blueprint for TASK-74. Do NOT implement during TASK-73. Extend the existing
> implementation — do NOT duplicate OAuth logic.

## Context
TASK-73 (Enterprise Auth & RBAC) is complete and pushed. This audit was produced
by verifying the live Meta integration code. All findings below are approved for
implementation in TASK-74.

## Verified-current state (working — DO NOT break)
- `services/meta/oauth.ts`:
  - `exchangeCodeForToken(code)` → short-lived user token ✅
  - `getLongLivedToken(short)` → `fb_exchange_token` → ~60d token ✅
  - `getPages(userToken)` → `GET /me/accounts?fields=id,name,access_token,category,tasks` ✅ (Page ID + page-scoped token captured)
  - `getInstagramBusiness(pageId, pageToken)` → detects linked IG Business ✅
  - `debugToken` / `tokenExpiryInfo` ✅
- `app/api/social/meta/{auth,callback}/route.ts`: CSRF state cookie, code→token→store flow ✅
- `services/social/accounts.ts`:
  - `connectMetaAccount()` + `connectAccount()` → `prisma.companySocialAccount.upsert` with **encrypted** token (`lib/crypto`), long-lived **user** token stored in `refreshToken` field, `expiresAt`/`accessTokenStatus`/`permissions` persisted ✅
  - `getDecryptedToken(id)` server-only ✅ (never returned to client)
- `app/api/social/facebook/live/route.ts`: live page info, `/posts`, `/conversations` ✅
- `lib/analytics/aggregator.ts`: `fetchFacebook` returns followers + posts + messages (reach/impressions/likes currently `null`)

## Approved findings → implement in TASK-74

### 1. Missing OAuth scopes (CRITICAL)
File: `services/meta/oauth.ts` → `META_SCOPES` (currently only 3).
Extend to match `lib/social-ui.ts` (do not remove existing):
```
pages_show_list
pages_read_engagement
public_profile
pages_manage_posts        // publish to FB page
read_insights            // FB page insights
instagram_basic          // IG media read
instagram_content_publish// IG publishing
instagram_manage_insights// IG insights
business_management      // Business Manager access
```

### 2. Automatic Meta token refresh (currently stub)
File: `services/social/accounts.ts` → `refreshAccount()` (Meta branch is a no-op stub
at the "Architecture-ready: Meta/LinkedIn refresh hooks go here" comment).
- The long-lived **user** token is already stored in `row.refreshToken` (encrypted).
- Implement Meta branch: decrypt `refreshToken` → re-call `getLongLivedToken(storedUserToken)`
  → re-encrypt + update `expiresAt`, `accessTokenStatus`, `status: CONNECTED`, `lastSyncAt`.
- Reuse `getLongLivedToken` from `services/meta/oauth.ts` (no new OAuth logic).
- Trigger: proactively before `expiresAt` (e.g. when `accessTokenStatus === "EXPIRING"` or on a scheduled/background refresh), not only on manual refresh click.

### 3. Facebook Insights
File: `lib/analytics/aggregator.ts` → `fetchFacebook()`.
- Add `GET /{pageId}/insights?metric=page_impressions,page_reach,page_engaged_users,page_posts_impressions,page_video_views&period=day` using the stored **page** token.
- Populate currently-`null` fields: `reach`, `impressions`, `engagement`/`engagementRate`, `videoViews`, `followersGrowthPct`.
- Graceful fallback to `null` if scope/token missing (keep honest-empty behavior, no fabrication).

### 4. Instagram Insights
File: `lib/analytics/aggregator.ts` (add `fetchInstagram`) + reuse `connectMetaAccount` IG id.
- `GET /{ig-user-id}/insights?metric=impressions,reach,engagement,follower_count,saved,profile_visits&period=day`
- `GET /{ig-user-id}/media?fields=id,caption,media_type,like_count,comments_count,permalink,timestamp`
- Add IG platform branch mirroring the Facebook one (connected flag, available:true, nulls on missing scope).

### 5. Complete Meta Graph Publishing Engine
File: `lib/publishing/engine.ts` (already has a Graph call; extend, do not rewrite).
- Publish to Facebook Page: `POST /{pageId}/feed` with page token (now permitted by `pages_manage_posts`).
- Publish to Instagram: `POST /{ig-user-id}/media` + `/media_publish` container flow (needs `instagram_content_publish`).
- Validate granted scopes before publishing; surface clear permission errors (do not fake success).
- Reuse `getDecryptedToken` + existing `PlatformKey` plumbing.

## Hard constraints (carry over from TASK-71/72/73)
- NEVER expose raw tokens to the client.
- Tokens encrypted at rest via `lib/crypto`; only `getDecryptedToken` (server) reads them.
- Extend current implementation; do not duplicate `services/meta/oauth.ts` logic.
- Honest empty states / `available:false` when a scope or live data is unavailable (TASK-51 rule).
- Keep RBAC: Meta connect/publish behind `SOCIAL_CONNECT` / `MANAGE_SOCIAL` as today.

## Verification checklist for TASK-74
- [ ] `META_SCOPES` includes all 9 scopes above; OAuth screen requests them.
- [ ] Stored Meta token auto-refreshes before expiry (verified via `expiresAt` advancing + `accessTokenStatus`).
- [ ] Facebook Insights populates reach/impressions/engagement (non-null when token has `read_insights`).
- [ ] Instagram Insights + media populate for connected IG Business account.
- [ ] Publishing engine posts to FB Page and IG (real Graph calls, not mocked).
- [ ] No token leaked to client; `tsc=0`; `build=0`; browser QA pass.

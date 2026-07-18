# TASK-75 LinkedIn and Website integrations

## Existing implementation audit

The repository already had encrypted `CompanySocialAccount` tokens, Meta and LinkedIn OAuth routes, a shared publishing queue/history model, a LinkedIn organization connection, and `WebsiteConnection` health/webhook routes. TASK-75 extends those components; it does not replace Meta, RBAC, authentication, navigation, analytics UI, or the publishing queue.

The previous LinkedIn implementation requested a hard-coded comma-delimited scope list, automatically selected the first organization, used the retired `ugcPosts` API, and treated public media URLs as LinkedIn asset URNs. The previous Website sync returned zero placeholder counts and outbound probes followed redirects without SSRF validation.

## LinkedIn configuration

`LINKEDIN_SCOPES` is a space-delimited allow-listed environment value. The application never guesses product approval. If the variable is absent, only `openid profile email` are requested; organization connection then reports the missing approval honestly.

Capability mapping:

| Capability | Accepted scope |
| --- | --- |
| Identity | `openid profile` |
| Organization discovery | `rw_organization_admin` or `r_organization_admin` |
| Read organization posts | `r_organization_social` or `r_organization_social_feed` |
| Publish organization posts and media | `w_organization_social` |
| Organization analytics | `rw_organization_admin` |

Approval state is determined by the token response and LinkedIn API responses. A configured scope can still be blocked by LinkedIn product approval; APIs return `NOT_AUTHORIZED` rather than fabricated data.

LinkedIn OAuth stores the state hash and encrypted temporary credentials in a ten-minute server-side session. The callback returns only an opaque session id. A user must select one of the approved company organizations returned by `organizationAcls`; school and personal-profile publishing are excluded.

`LINKEDIN_API_VERSION` defaults to `202606` and must be reviewed as LinkedIn sunsets monthly Marketing API versions.

## LinkedIn provider behavior

- Posts use the versioned `/rest/posts` API.
- Images use `images?action=initializeUpload`, binary upload, status confirmation, then a post referencing the image URN.
- MP4 videos use initialize, part upload, finalize, status confirmation, and a post referencing the video URN.
- Scheduled publishing and retries continue through the existing Post, PostPlatform, PublishingHistory, and publishing queue services.
- Post sync uses real organization posts and stores unavailable engagement metrics as `null`.
- Followers, share statistics, and page views return per-metric `AVAILABLE`, `NOT_AUTHORIZED`, `UNSUPPORTED`, `TEMPORARILY_UNAVAILABLE`, or `NO_DATA` state.
- When LinkedIn does not issue a refresh token, the connection is marked for secure reauthorization; refresh is never simulated.

## Website providers

| Provider | Sync | Publish | Webhook |
| --- | --- | --- | --- |
| WordPress | Yes | Draft/create/update | Optional |
| REST API / Custom / Next.js / Headless / Laravel | Yes | Contract-based create/update | Yes |
| RSS / Atom | Yes | Read-only | No |
| XML Sitemap / Static | Yes | Read-only | No |
| Webhook | Inbound only | Read-only | Required |

Website content is incrementally upserted into the existing `Post` model by `(sourceConnectionId, externalContentId)`. Canonical URLs and provider cursors prevent repeated imports.

All outbound website URLs and redirects are limited to public HTTP(S) destinations, with HTTPS required in production. Localhost, private/reserved IP ranges, internal host suffixes, credentials in URLs, unsafe ports, DNS results pointing to private networks, oversized responses, and credential-bearing cross-origin redirects are blocked.

Inbound webhooks require `x-k2kai-event-id`, `x-k2kai-timestamp`, and `x-k2kai-signature`. The signature is `HMAC-SHA256(secret, timestamp + "." + rawBody)`. Timestamps have a five-minute window and event ids are stored uniquely for replay protection.

## API routes

LinkedIn: connect, callback, organization selection, accounts, posts/sync/publish, insights, health, refresh, and disconnect under `/api/social/linkedin/*`.

Website: connect/list, test/status, sync, publish, signed webhook, disconnect, and reconnect under `/api/website/*`.

All secrets remain server-side and encrypted at rest. Public responses contain capability, health, status, recovery, and availability metadata only.

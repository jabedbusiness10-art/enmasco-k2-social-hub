# Meta Business Login Setup

K2KAI uses **Facebook Login for Business**. The OAuth URL contains `config_id` and does not send a generic hardcoded `scope` parameter. Meta App Dashboard is the source of truth for permissions.

## Required dashboard checks

1. Open the Meta App Dashboard and confirm the app type/use case is **Business**.
2. Add **Facebook Login for Business** to the app. Basic Facebook Login is not the connection flow used by K2KAI.
3. Create a Business Login configuration and copy its configuration ID to `META_LOGIN_CONFIG_ID` in `.env.local`.
4. Register the exact `META_REDIRECT_URI`. Locally this is normally `http://localhost:3000/api/social/meta/callback`; production uses the public HTTPS origin.
5. While the app is in development mode, connect only with a Meta app Administrator, Developer, or Tester.
6. Confirm the connecting Facebook user has **full control** of the ENMASCO Facebook Page. The callback rejects Pages that do not report the `MANAGE` task.
7. Confirm the Instagram Professional/Business account is linked to that Facebook Page before enabling Instagram features.

## Incremental permission stages

Start with both the Business Login configuration and `.env.local` set for Page connection only:

```env
META_OAUTH_FEATURES="facebook_connect"
```

| Feature | Permissions that must exist in the Business Login configuration |
|---|---|
| `facebook_connect` | `pages_show_list`, `pages_read_engagement` |
| `facebook_publish` | `pages_manage_posts` |
| `facebook_insights` | `read_insights` |
| `instagram_publish` | `instagram_basic`, `instagram_content_publish` |
| `instagram_insights` | `instagram_basic`, `instagram_manage_insights` |

Add features only after their permissions are visible in the Business Login configuration and the required access/App Review is approved. Example after Facebook publishing is approved:

```env
META_OAUTH_FEATURES="facebook_connect,facebook_publish"
```

Then enable Instagram publishing, and finally insights. If Meta reports a permission as invalid or unavailable, remove that feature from `META_OAUTH_FEATURES` and from the dashboard configuration until approval is complete.

## Diagnostics

The server logs the sanitized OAuth URL, Business Login configuration ID, expected permission set, granted permissions, missing permissions, and callback errors. OAuth state and access tokens are never logged.

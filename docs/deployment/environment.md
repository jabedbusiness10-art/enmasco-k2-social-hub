# K2KAI Social OS — Environment Configuration

All runtime configuration is supplied through environment variables. **No
value is hardcoded in source code.** The canonical production domain is
injected only via `APP_URL` / `NEXTAUTH_URL`.

Copy `.env.example` → `.env.local` and fill in real values. `.env.local` is
gitignored and must never be committed.

## Variables

| Variable | Purpose | Notes |
|----------|---------|-------|
| `APP_NAME` | Branding name | `K2KAI Social OS` |
| `APP_URL` | Canonical base URL | `https://k2kai.enmasco.com` |
| `NEXTAUTH_URL` | Auth base URL | Must equal `APP_URL` |
| `NEXTAUTH_SECRET` | Session signing | `openssl rand -base64 32` |
| `DATABASE_URL` | PostgreSQL connection | Prisma datasource |
| `REDIS_URL` | Managed Redis connection for BullMQ | Optional in development; absent → active database queue fallback |
| `OPENAI_API_KEY` | AI provider (optional) | |
| `OPENROUTER_API_KEY` | AI provider (preferred) | |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASSWORD` / `SMTP_FROM` | Email | |
| `META_APP_ID` / `META_APP_SECRET` | Facebook/Meta OAuth | |
| `INSTAGRAM_APP_ID` / `INSTAGRAM_APP_SECRET` | Instagram OAuth | |
| `LINKEDIN_CLIENT_ID` / `LINKEDIN_CLIENT_SECRET` | LinkedIn OAuth | |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google/YouTube OAuth | |
| `STORAGE_PROVIDER` / `STORAGE_BUCKET` | Media storage | `local` default |
| `CLOUDINARY_URL` | Cloudinary (if used) | |
| `ENCRYPTION_KEY` | Token encryption at rest | `openssl rand -base64 32` |
| `QUEUE_SECRET` | Worker auth | `openssl rand -base64 24` |
| `NEXT_PUBLIC_MESSENGER_WS` | Messenger Socket.IO URL | `wss://k2kai.enmasco.com` |
| `NODE_ENV` | Runtime mode | `production` |
| `LOG_LEVEL` | Log verbosity | `info` |

## OAuth callback URLs (env-derived)

Set these in each provider console exactly:

```
${APP_URL}/api/auth/callback/meta
${APP_URL}/api/auth/callback/instagram
${APP_URL}/api/auth/callback/linkedin
${APP_URL}/api/auth/callback/google
```

No `localhost` values in production.

## Validate

```bash
npm run validate:env   # fails fast if required vars missing
```

## Managed Redis / Queue Engine

Local Redis is not required. When `REDIS_URL` is absent, the application runs
normally with its built-in database queue and reports Redis as not configured.
BullMQ and live Redis metrics remain disabled without fabricating connectivity.

For production or high-volume background processing, provision a managed Redis
service and place its private connection URL in `.env.local` or the deployment
secret manager:

```dotenv
REDIS_URL="redis://default:password@host:port"
```

Use `rediss://` when the provider requires TLS. Never commit the real URL. After
the process restarts with a valid URL, the existing queue engine automatically
activates BullMQ and live metrics; no UI or code change is required.

## Security

- Never commit `.env.local`.
- Rotate `NEXTAUTH_SECRET`, `ENCRYPTION_KEY`, `QUEUE_SECRET` on a schedule.
- Store secrets in a manager (Vault / Doppler / cloud secret manager) in real
  deployments; this template is the local reference only.

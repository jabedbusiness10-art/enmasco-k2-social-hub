# K2KAI Social Flow — Production Deployment Guide (TASK-59)

Enterprise-grade deployment for **K2KAI Social Flow by ENMASCO**.
No UI/ business logic changes — this is infrastructure only.

---

## 1. Prerequisites
- Node.js 20+ (Docker image uses `node:20-alpine`)
- PostgreSQL 16+ (Prisma 7 pg driver adapter)
- Redis 7+ (required only for BullMQ background jobs — absent ⇒ DB fallback)
- Domain + TLS certificate (Let's Encrypt)

---

## 2. Environment Validation (PART 1)
Copy the template and fill REAL secrets:

```bash
cp .env.example .env.local        # local dev
# production: export every var in .env.example to your secret manager
```

Validate (logs a report, never crashes):
```bash
npm run validate:env
```

| Severity | Vars | Missing behaviour |
|----------|------|------------------|
| CRITICAL | `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` | App logs hard error, auth/DB fail |
| OPTIONAL | `META_*`, `LINKEDIN_*`, `GOOGLE_*`, `OPENROUTER_API_KEY`, `REDIS_URL`, `SMTP_*`, `CLOUDINARY_URL`, `ENCRYPTION_KEY` | Integration disabled, app still runs |

Validation also runs automatically at boot via `instrumentation.ts`.

---

## 3. Database Migration (PART 8)
```bash
npx prisma generate
npx prisma migrate deploy     # prod (idempotent)
# or, for fast envs without a migration history:
npx prisma db push
# seed (if a seed script exists):
npx prisma db seed
```

---

## 4. Production Build (PART 4 / PART 10)
```bash
npm ci --legacy-peer-deps      # matches Dockerfile (peer conflict w/ @base-ui/react)
npm run build                  # runs `prisma generate && next build`
```
Build is optimized for: image optimization (Cloudinary + CDN remote patterns),
font/library tree-shaking, route-level code splitting, and the security headers
below. **Never run `next build` while `next dev` is live** (shared `.next`
corruption ⇒ 500s).

---

## 5. Docker — one-command stack (PART 3)
```bash
cp .env.example .env          # docker-compose reads .env
docker compose up -d --build
```
Services: `postgres`, `redis`, `web` (Next.js), `worker` (BullMQ), `scheduler`
(repeatable jobs). Role is selected by the `ROLE` env via `docker-entrypoint.sh`.

Verify health:
```bash
curl -fsS http://localhost:3000/api/health
```

---

## 6. PM2 (no-Docker hosts) (PART 2 / PART 4)
```bash
npm i -g pm2
pm2 start ecosystem.config.js
pm2 save && pm2 startup
```
Boots `k2kai-web` (cluster), `k2kai-worker`, `k2kai-scheduler`.

---

## 7. Nginx + TLS (PART 5 / PART 7)
```bash
cp nginx.conf /etc/nginx/sites-available/k2kai
ln -s /etc/nginx/sites-available/k2kai /etc/nginx/sites-enabled/
certbot --nginx -d app.k2kai.com
nginx -t && systemctl reload nginx
```
Nginx adds: TLS 1.2/1.3, HTTP→HTTPS redirect, API rate limit
(20 r/s, burst 40), Socket.IO websocket upgrade, and defense-in-depth headers.

---

## 8. Security Headers (PART 5)
Set in `next.config.mjs` for **every** route:
`Content-Security-Policy`, `Strict-Transport-Security` (prod), `X-Content-Type-Options`,
`X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy`, `Permissions-Policy`,
`X-DNS-Prefetch-Control`. Middleware also enforces auth + a sliding-window
API rate limit (single-instance; for multi-instance use Redis-backed limiter).

Cookie security is handled by next-auth (`httpOnly`, `secure` in prod,
`sameSite: lax`). Never log `NEXTAUTH_SECRET` / tokens.

---

## 9. Logging (PART 6)
`lib/logger.ts` — level-gated, module-tagged (`[api] [queue] [auth] [ai] …`).
Set `LOG_LEVEL=debug|info|warn|error`. With Docker/PM2/systemd all output
goes to stdout/stderr — ship to your log aggregator (Datadog, Loki, CloudWatch).

---

## 10. Health Monitoring (PART 7)
`GET /api/health` (unauthenticated) returns:
```json
{ "status":"healthy", "version":"1.0.0", "checks": {
    "database": {...}, "redis": {...}, "bullmq": {...},
    "externalApis": {...}, "system": { "uptimeSec": 123, "memoryMb": 256, "node":"v20" }
}}
```
Wire this into your uptime probe / load-balancer health check.

---

## 11. Go-Live Checklist (PART 8 / PART 10)
- [ ] `.env` has all CRITICAL vars (DB, NEXTAUTH_SECRET, NEXTAUTH_URL)
- [ ] `npm run validate:env` passes with no critical missing
- [ ] `npx prisma migrate deploy` applied
- [ ] `npm run build` succeeds
- [ ] Docker image builds (`docker compose build`) OR PM2 starts clean
- [ ] `/api/health` returns `healthy`
- [ ] TLS certificate installed; HTTP→HTTPS redirect works
- [ ] DNS A/AAAA record points to the host
- [ ] Daily DB backup configured (pg_dump → object storage)
- [ ] Redis up ⇒ BullMQ `worker` + `scheduler` processing jobs
- [ ] Monitoring/alerting on `/api/health` + error logs
- [ ] `robots.txt` + `sitemap.xml` served

---

## 12. Performance Targets (PART 9)
Next build enables code-splitting + image optimization. Target Lighthouse
(verify post-deploy): Performance 95+, Accessibility 95+, SEO 90+, Best
Practices 100. Lazy-load heavy charts (recharts) and virtualize long tables.

---

## 13. Notes / Limitations
- The in-memory API rate limiter (middleware) is per-instance only. Behind
  multiple web replicas, add a Redis-backed limiter (see `lib/logger` note).
- BullMQ requires Redis. Without `REDIS_URL` the app runs fully on the
  DB-backed queue fallback — no background jobs, but zero crashes.
- Secrets stay in `.env.local` (gitignored). Never commit real credentials.

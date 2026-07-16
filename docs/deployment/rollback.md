# K2KAI Social OS — Rollback

Zero-downtime rollback uses git tags + PM2. The app code is immutable per tag;
no schema rollback is needed for app-only regressions (schema is additive).

## 1. Identify the last-good tag

```bash
git tag --sort=-creatordate | head
# e.g. v1.0.0-rc1
```

## 2. Roll back the application

```bash
git fetch --tags
git checkout v1.0.0-rc1
npm ci
npx prisma generate
npm run build
pm2 restart ecosystem.config.js
```

## 3. Roll back a single bad commit (no tag)

```bash
git revert <bad-commit-sha>
git push origin main
pm2 reload k2kai-web
```

## 4. Database

Schema changes in this project are **additive** (no destructive migrations),
so most app rollbacks need no DB change. If a future migration is destructive:

```bash
# Restore the pre-migration dump (see backup.md)
pg_restore --clean --if-exists -U k2kai -d k2kai /var/backups/k2kai/db/k2kai-<DATE>.dump
```

## 5. Proxy / TLS

Proxy and TLS config are static (`deploy/nginx.conf` / `deploy/Caddyfile`).
Roll them back by checking out the previous version of those files and
reloading the proxy — no app restart required.

## 6. Verification after rollback

```bash
curl -I https://k2kai.enmasco.com/api/health   # 200
curl -I https://k2kai.enmasco.com/manifest.webmanifest  # 200
# Log in and confirm dashboard renders
pm2 logs k2kai-web --lines 50
```

## 7. Quick checklist

- [ ] App tag checked out + rebuilt
- [ ] `pm2 restart` successful
- [ ] `/api/health` returns 200
- [ ] DB dump restored (only if destructive migration)
- [ ] Proxy reloaded (only if proxy changed)
- [ ] Browser login + dashboard verified

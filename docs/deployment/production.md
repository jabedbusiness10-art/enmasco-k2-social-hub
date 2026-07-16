# K2KAI Social OS — Production Deployment Guide

**Project:** K2KAI Social OS · **Company:** ENMASCO
**Canonical URL:** https://k2kai.enmasco.com

This guide covers a real production deployment on a single Ubuntu 22.04 LTS
server using Node.js, PostgreSQL, Redis, NGINX (or Caddy), and PM2. It does
**not** change any application code — it only documents the runtime wiring.

---

## 1. Architecture

```
Internet
   │
   ├─ HTTPS (443) ──► NGINX / Caddy  (TLS, redirect, gzip/brotli, cache, WS upgrade)
   │                      │
   │                      ├─► PM2 cluster  "k2kai-web"      (next start -p 3000)
   │                      ├─► PM2 fork    "k2kai-worker"   (queue worker)
   │                      └─► PM2 fork    "k2kai-scheduler"(scheduler)
   │
   ├─ PostgreSQL  (primary datastore, Prisma)
   └─ Redis       (BullMQ queue; optional — DB fallback if absent)
```

## 2. Prerequisites

- Ubuntu 22.04 LTS (2 vCPU / 4 GB RAM minimum; 4 vCPU / 8 GB recommended)
- Domain `k2kai.enmasco.com` pointed at the server's public IP (A record)
- Node.js 20 LTS, pnpm or npm
- PostgreSQL 15+, Redis 7+ (optional)
- NGINX ≥ 1.22 (with http_v2 + optional Brotli) **or** Caddy ≥ 2.7

## 3. Server setup

```bash
sudo apt update && sudo apt -y upgrade
sudo apt -y install curl git build-essential
# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt -y install nodejs
node -v   # v20.x
sudo npm i -g pm2
```

## 4. PostgreSQL

```bash
sudo apt -y install postgresql postgresql-contrib
sudo -u postgres psql -c "CREATE DATABASE k2kai;"
sudo -u postgres psql -c "CREATE USER k2kai WITH PASSWORD 'STRONG_DB_PASSWORD';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE k2kai TO k2kai;"
```

## 5. Redis (optional but recommended)

```bash
sudo apt -y install redis-server
sudo systemctl enable --now redis-server
```

## 6. Application

```bash
git clone <repo> /var/www/k2kai
cd /var/www/k2kai
npm ci
cp .env.example .env.local      # then EDIT with real secrets (see environment.md)
# Generate Prisma client + sync schema
npx prisma generate
npx prisma db push
# Production build
npm run build
```

## 7. Process manager (PM2)

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup   # enable on boot
# (optional) log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

## 8. Reverse proxy

- **NGINX:** copy `deploy/nginx.conf` to `/etc/nginx/sites-available/k2kai`
  and symlink into `sites-enabled`; `sudo nginx -t && sudo systemctl reload nginx`.
  See `nginx.md`.
- **Caddy:** use `deploy/Caddyfile`; `caddy run --config deploy/Caddyfile`.
  See `nginx.md` (Caddy section).

## 9. TLS / SSL

Use Let's Encrypt (certbot) or Caddy's built-in. See `ssl.md`.

## 10. Verify

```bash
curl -I https://k2kai.enmasco.com/api/health      # 200, JSON health
curl -I https://k2kai.enmasco.com/manifest.webmanifest  # 200
curl -I https://k2kai.enmasco.com/service-worker.js    # 200, no-cache
# Browser: login, confirm dashboard, PWA install prompt, offline page
```

## 11. Rollback

Tagged releases + `git revert` / redeploy previous tag. See `rollback.md`.

---

**Status:** App functionality is untouched. This document is infrastructure
guidance only.

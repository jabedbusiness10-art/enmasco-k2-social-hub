# K2KAI Social OS — Backup & Disaster Recovery

Backups cover the three stateful layers: **PostgreSQL**, **Redis** (optional),
and **uploaded media**.

## PostgreSQL (primary)

```bash
# Daily dump (cron @ 02:00)
pg_dump --format=custom --no-owner -U k2kai k2kai \
  > /var/backups/k2kai/db/k2kai-$(date +%F).dump
# Keep 14 days
find /var/backups/k2kai/db -name '*.dump' -mtime +14 -delete
```

Restore:

```bash
pg_restore --clean --if-exists --no-owner -U k2kai -d k2kai \
  /var/backups/k2kai/db/k2kai-YYYY-MM-DD.dump
```

The app also has an in-app **Backup Center** (Administration → Backup) that
performs logical backups; those complement, not replace, the DB dump above.

## Redis (optional)

If Redis persists (RDB/AOF), back up the dump:

```bash
redis-cli --rdb /var/backups/k2kai/redis/dump-$(date +%F).rdb
```

If Redis is absent, the queue engine uses the **DB fallback** — there is
nothing to back up for the queue.

## Media uploads

```bash
rsync -a /var/www/k2kai/public/uploads/ /var/backups/k2kai/uploads/$(date +%F)/
```

If `STORAGE_PROVIDER=cloudinary`, media lives off-server; snapshot the
provider instead.

## Offsite

Copy `/var/backups/k2kai/` to object storage (S3/Cloudinary/`STORAGE_BUCKET`)
nightly. Encrypt at rest.

## Restore order

1. PostgreSQL → 2. Redis (optional) → 3. uploads → 4. redeploy app →
5. `npx prisma generate && npx prisma db push` → 6. `pm2 restart all`.

## RPO / RTO (suggested)

- RPO: 24h (daily dump) — tighten with WAL archiving for <5 min.
- RTO: < 1h (restore + redeploy).

#!/bin/sh
# TASK-59.3 — runtime role selector for the K2KAI container image.
# ROLE env (set by docker-compose) picks what this container runs:
#   web       -> Next.js production server (default)
#   worker    -> BullMQ worker process (tsx)
#   scheduler -> BullMQ repeatable-job scheduler (tsx)
set -e

# Generate Prisma client + apply migrations on first boot (idempotent).
npx prisma generate >/dev/null 2>&1 || true
npx prisma migrate deploy 2>&1 | tail -3 || echo "migrate deploy skipped (no migrations dir)"

case "${ROLE:-web}" in
  worker)
    echo "[entrypoint] starting BullMQ WORKER"
    exec npx tsx server/queue-worker.ts
    ;;
  scheduler)
    echo "[entrypoint] starting BullMQ SCHEDULER"
    exec npx tsx server/scheduler.ts
    ;;
  web|*)
    echo "[entrypoint] starting WEB (Next.js)"
    exec node -r dotenv/config ./node_modules/next/dist/bin/next start -p 3000
    ;;
esac

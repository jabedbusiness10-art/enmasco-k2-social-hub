# ============================================================
# TASK-59.3 — K2KAI Social Flow — Production Dockerfile
# Multi-stage build. Output: a single image that can run as
#   web | worker | scheduler  (selected via the CMD arg)
# ============================================================
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
ENV NODE_ENV=production
# Prisma needs the query engine binaries present at runtime.
ENV PRISMA_ENGINES_MIRROR=https://binaries.prisma.sh

# ---- deps ----
FROM base AS deps
COPY package.json package-lock.json* ./
# --legacy-peer-deps mirrors the dev install (peer conflict w/ @base-ui/react)
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# ---- build ----
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Generate Prisma client + run migrations against DATABASE_URL at deploy time.
RUN npx prisma generate
RUN npm run build

# ---- runtime ----
FROM base AS runner
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
USER nextjs

# role: web (default) | worker | scheduler — selected via ROLE env in compose
COPY --from=builder /app/server ./server
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]

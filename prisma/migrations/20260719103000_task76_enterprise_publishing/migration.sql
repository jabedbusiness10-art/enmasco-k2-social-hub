-- TASK-76: central provider coverage and isolated per-provider lifecycle state.
ALTER TYPE "Platform" ADD VALUE IF NOT EXISTS 'TIKTOK';
ALTER TYPE "Platform" ADD VALUE IF NOT EXISTS 'THREADS';
ALTER TYPE "Platform" ADD VALUE IF NOT EXISTS 'PINTEREST';

ALTER TABLE "PostPlatform"
  ADD COLUMN "providerStatus" TEXT,
  ADD COLUMN "retryCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "maxRetries" INTEGER NOT NULL DEFAULT 3,
  ADD COLUMN "lastAttemptAt" TIMESTAMP(3),
  ADD COLUMN "nextRetryAt" TIMESTAMP(3),
  ADD COLUMN "publishedAt" TIMESTAMP(3),
  ADD COLUMN "providerMetadata" JSONB;

CREATE INDEX "PostPlatform_nextRetryAt_idx" ON "PostPlatform"("nextRetryAt");

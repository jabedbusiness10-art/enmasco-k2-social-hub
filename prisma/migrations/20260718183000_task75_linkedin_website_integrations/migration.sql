-- TASK-75: additive LinkedIn and Website integration metadata.
ALTER TYPE "CmsType" ADD VALUE IF NOT EXISTS 'REST_API';
ALTER TYPE "CmsType" ADD VALUE IF NOT EXISTS 'RSS';
ALTER TYPE "CmsType" ADD VALUE IF NOT EXISTS 'SITEMAP';
ALTER TYPE "CmsType" ADD VALUE IF NOT EXISTS 'WEBHOOK';

ALTER TABLE "CompanySocialAccount"
  ADD COLUMN "providerCapabilities" JSONB,
  ADD COLUMN "permissionStatus" TEXT,
  ADD COLUMN "connectionMetadata" JSONB,
  ADD COLUMN "lastValidatedAt" TIMESTAMP(3),
  ADD COLUMN "lastPublishAt" TIMESTAMP(3),
  ADD COLUMN "lastError" TEXT;

ALTER TABLE "WebsiteConnection"
  ALTER COLUMN "apiKey" DROP NOT NULL,
  ALTER COLUMN "webhookSecret" DROP NOT NULL,
  ADD COLUMN "apiEndpoint" TEXT,
  ADD COLUMN "authMethod" TEXT NOT NULL DEFAULT 'NONE',
  ADD COLUMN "providerCapabilities" JSONB,
  ADD COLUMN "lastPublish" TIMESTAMP(3),
  ADD COLUMN "lastWebhook" TIMESTAMP(3),
  ADD COLUMN "lastError" TEXT,
  ADD COLUMN "syncCursor" TEXT,
  ADD COLUMN "authStatus" TEXT NOT NULL DEFAULT 'UNKNOWN',
  ADD COLUMN "publishingEnabled" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "connectedById" TEXT;

ALTER TABLE "Post"
  ADD COLUMN "externalContentId" TEXT,
  ADD COLUMN "canonicalUrl" TEXT,
  ADD COLUMN "sourceProvider" TEXT,
  ADD COLUMN "sourceConnectionId" TEXT,
  ADD COLUMN "sourceMetadata" JSONB,
  ADD COLUMN "lastExternalSyncAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "Post_sourceConnectionId_externalContentId_key"
  ON "Post"("sourceConnectionId", "externalContentId");
CREATE INDEX "Post_canonicalUrl_idx" ON "Post"("canonicalUrl");

CREATE TABLE "LinkedInOAuthSession" (
  "id" TEXT NOT NULL,
  "stateHash" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "accessTokenEncrypted" TEXT,
  "refreshTokenEncrypted" TEXT,
  "tokenExpiresAt" TIMESTAMP(3),
  "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "organizations" JSONB,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "consumedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LinkedInOAuthSession_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "LinkedInOAuthSession_stateHash_key" ON "LinkedInOAuthSession"("stateHash");
CREATE INDEX "LinkedInOAuthSession_userId_idx" ON "LinkedInOAuthSession"("userId");
CREATE INDEX "LinkedInOAuthSession_expiresAt_idx" ON "LinkedInOAuthSession"("expiresAt");

CREATE TABLE "WebsiteWebhookDelivery" (
  "id" TEXT NOT NULL,
  "connectionId" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "payloadHash" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'RECEIVED',
  "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "processedAt" TIMESTAMP(3),
  CONSTRAINT "WebsiteWebhookDelivery_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "WebsiteWebhookDelivery_connectionId_eventId_key"
  ON "WebsiteWebhookDelivery"("connectionId", "eventId");
CREATE INDEX "WebsiteWebhookDelivery_connectionId_receivedAt_idx"
  ON "WebsiteWebhookDelivery"("connectionId", "receivedAt");

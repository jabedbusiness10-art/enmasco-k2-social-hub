-- TASK-70 — Enterprise Database Foundation
-- Additive, non-destructive migration. Creates the remaining production tables
-- (Team, DraftPost, AIJob, ActivityLog, ApiConnection, PostAnalytics), the
-- supporting enums, the username unique constraint on User, and the TeamMember
-- team/company links. No existing table is altered destructively and no data is
-- removed. Generated to match the applied schema (prisma db push).

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
CREATE TYPE "TeamStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'SUSPENDED');
CREATE TYPE "DraftStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'READY', 'ARCHIVED');
CREATE TYPE "AIJobStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');
CREATE TYPE "ApiConnStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'REVOKED', 'ERROR');

-- ---------------------------------------------------------------------------
-- TeamMember — add team / company links
-- ---------------------------------------------------------------------------
ALTER TABLE "TeamMember" ADD COLUMN "teamId" TEXT;
ALTER TABLE "TeamMember" ADD COLUMN "companyId" TEXT;

ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "TeamMember_teamId_idx" ON "TeamMember"("teamId");
CREATE INDEX "TeamMember_companyId_idx" ON "TeamMember"("companyId");

-- ---------------------------------------------------------------------------
-- User — add username (unique) + teamId link
-- ---------------------------------------------------------------------------
ALTER TABLE "User" ADD COLUMN "username" TEXT;
ALTER TABLE "User" ADD COLUMN "teamId" TEXT;

ALTER TABLE "User" ADD CONSTRAINT "User_username_key" UNIQUE ("username");
ALTER TABLE "User" ADD CONSTRAINT "User_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "User_teamId_idx" ON "User"("teamId");
CREATE INDEX "User_username_idx" ON "User"("username");

-- ---------------------------------------------------------------------------
-- Team
-- ---------------------------------------------------------------------------
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "ownerId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "status" "TeamStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Team" ADD CONSTRAINT "Team_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Team" ADD CONSTRAINT "Team_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Team_companyId_idx" ON "Team"("companyId");
CREATE INDEX "Team_ownerId_idx" ON "Team"("ownerId");
CREATE INDEX "Team_status_idx" ON "Team"("status");
CREATE UNIQUE INDEX "Team_slug_key" ON "Team"("slug");
CREATE INDEX "Team_createdAt_idx" ON "Team"("createdAt");

-- ---------------------------------------------------------------------------
-- DraftPost
-- ---------------------------------------------------------------------------
CREATE TABLE "DraftPost" (
    "id" TEXT NOT NULL,
    "teamId" TEXT,
    "authorId" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT,
    "platforms" "Platform"[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "mediaUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "DraftStatus" NOT NULL DEFAULT 'DRAFT',
    "postId" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DraftPost_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "DraftPost" ADD CONSTRAINT "DraftPost_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DraftPost" ADD CONSTRAINT "DraftPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DraftPost" ADD CONSTRAINT "DraftPost_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "DraftPost_teamId_idx" ON "DraftPost"("teamId");
CREATE INDEX "DraftPost_authorId_idx" ON "DraftPost"("authorId");
CREATE INDEX "DraftPost_status_idx" ON "DraftPost"("status");
CREATE UNIQUE INDEX "DraftPost_postId_key" ON "DraftPost"("postId");
CREATE INDEX "DraftPost_createdAt_idx" ON "DraftPost"("createdAt");
CREATE INDEX "DraftPost_updatedAt_idx" ON "DraftPost"("updatedAt");

-- ---------------------------------------------------------------------------
-- AIJob
-- ---------------------------------------------------------------------------
CREATE TABLE "AIJob" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "model" TEXT,
    "prompt" TEXT,
    "status" "AIJobStatus" NOT NULL DEFAULT 'PENDING',
    "result" TEXT,
    "error" TEXT,
    "tokensUsed" INTEGER NOT NULL DEFAULT 0,
    "durationMs" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIJob_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "AIJob" ADD CONSTRAINT "AIJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "AIJob_userId_idx" ON "AIJob"("userId");
CREATE INDEX "AIJob_type_idx" ON "AIJob"("type");
CREATE INDEX "AIJob_status_idx" ON "AIJob"("status");
CREATE INDEX "AIJob_createdAt_idx" ON "AIJob"("createdAt");
CREATE INDEX "AIJob_updatedAt_idx" ON "AIJob"("updatedAt");

-- ---------------------------------------------------------------------------
-- ActivityLog
-- ---------------------------------------------------------------------------
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT,
    "entityId" TEXT,
    "metadata" JSONB,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "ActivityLog_userId_idx" ON "ActivityLog"("userId");
CREATE INDEX "ActivityLog_action_idx" ON "ActivityLog"("action");
CREATE INDEX "ActivityLog_entity_idx" ON "ActivityLog"("entity");
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

-- ---------------------------------------------------------------------------
-- ApiConnection
-- ---------------------------------------------------------------------------
CREATE TABLE "ApiConnection" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "status" "ApiConnStatus" NOT NULL DEFAULT 'ACTIVE',
    "maskedKey" TEXT,
    "baseUrl" TEXT,
    "scopes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiConnection_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ApiConnection" ADD CONSTRAINT "ApiConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "ApiConnection_userId_idx" ON "ApiConnection"("userId");
CREATE INDEX "ApiConnection_provider_idx" ON "ApiConnection"("provider");
CREATE INDEX "ApiConnection_status_idx" ON "ApiConnection"("status");
CREATE INDEX "ApiConnection_createdAt_idx" ON "ApiConnection"("createdAt");

-- ---------------------------------------------------------------------------
-- PostAnalytics
-- ---------------------------------------------------------------------------
CREATE TABLE "PostAnalytics" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "platform" "Platform",
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "engagements" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostAnalytics_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "PostAnalytics" ADD CONSTRAINT "PostAnalytics_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "PostAnalytics_postId_idx" ON "PostAnalytics"("postId");
CREATE INDEX "PostAnalytics_platform_idx" ON "PostAnalytics"("platform");
CREATE INDEX "PostAnalytics_recordedAt_idx" ON "PostAnalytics"("recordedAt");

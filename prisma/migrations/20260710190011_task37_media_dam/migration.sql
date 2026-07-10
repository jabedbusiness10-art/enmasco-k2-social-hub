-- CreateEnum
CREATE TYPE "MediaStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'TRASHED');

-- AlterTable
ALTER TABLE "MediaAsset" ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "description" TEXT,
ADD COLUMN     "duration" DOUBLE PRECISION,
ADD COLUMN     "extension" TEXT,
ADD COLUMN     "folderId" TEXT,
ADD COLUMN     "lastUsedAt" TIMESTAMP(3),
ADD COLUMN     "status" "MediaStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "usageCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "MediaFolder" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "parentId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaFolder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaActivity" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "meta" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MediaFolder_slug_key" ON "MediaFolder"("slug");

-- CreateIndex
CREATE INDEX "MediaFolder_parentId_idx" ON "MediaFolder"("parentId");

-- CreateIndex
CREATE INDEX "MediaActivity_assetId_idx" ON "MediaActivity"("assetId");

-- CreateIndex
CREATE INDEX "MediaActivity_createdAt_idx" ON "MediaActivity"("createdAt");

-- CreateIndex
CREATE INDEX "MediaAsset_folderId_idx" ON "MediaAsset"("folderId");

-- CreateIndex
CREATE INDEX "MediaAsset_status_idx" ON "MediaAsset"("status");

-- AddForeignKey
ALTER TABLE "MediaFolder" ADD CONSTRAINT "MediaFolder_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "MediaFolder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "MediaFolder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaActivity" ADD CONSTRAINT "MediaActivity_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "MediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - Added the required column `accessToken` to the `CompanySocialAccount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `connectedBy` to the `CompanySocialAccount` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PlatformStatus" AS ENUM ('CONNECTED', 'EXPIRING_SOON', 'DISCONNECTED', 'PERMISSION_ERROR');

-- AlterTable
ALTER TABLE "CompanySocialAccount" ADD COLUMN     "accessToken" TEXT NOT NULL,
ADD COLUMN     "accountId" TEXT,
ADD COLUMN     "connectedBy" TEXT NOT NULL,
ADD COLUMN     "connectedById" TEXT,
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "pageId" TEXT,
ADD COLUMN     "refreshToken" TEXT,
ADD COLUMN     "status" "PlatformStatus" NOT NULL DEFAULT 'CONNECTED',
ADD COLUMN     "username" TEXT;

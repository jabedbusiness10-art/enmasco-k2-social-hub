/*
  Warnings:

  - You are about to drop the column `name` on the `MediaAsset` table. All the data in the column will be lost.
  - You are about to drop the column `sizeBytes` on the `MediaAsset` table. All the data in the column will be lost.
  - Added the required column `cloudinaryId` to the `MediaAsset` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileName` to the `MediaAsset` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileSize` to the `MediaAsset` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileType` to the `MediaAsset` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalName` to the `MediaAsset` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uploadedBy` to the `MediaAsset` table without a default value. This is not possible if the table is not empty.
  - Made the column `mimeType` on table `MediaAsset` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "MediaAsset" DROP COLUMN "name",
DROP COLUMN "sizeBytes",
ADD COLUMN     "cloudinaryId" TEXT NOT NULL,
ADD COLUMN     "fileName" TEXT NOT NULL,
ADD COLUMN     "fileSize" INTEGER NOT NULL,
ADD COLUMN     "fileType" TEXT NOT NULL,
ADD COLUMN     "height" INTEGER,
ADD COLUMN     "originalName" TEXT NOT NULL,
ADD COLUMN     "uploadedBy" TEXT NOT NULL,
ADD COLUMN     "width" INTEGER,
ALTER COLUMN "mimeType" SET NOT NULL;

-- CreateIndex
CREATE INDEX "MediaAsset_fileType_idx" ON "MediaAsset"("fileType");

/*
  Warnings:

  - You are about to drop the column `isProject` on the `folder` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `folder` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "folder" DROP COLUMN "isProject",
DROP COLUMN "title";

-- CreateTable
CREATE TABLE "FolderDataBlock" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "folderId" INTEGER,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "FolderDataBlock_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FolderDataBlock" ADD CONSTRAINT "FolderDataBlock_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

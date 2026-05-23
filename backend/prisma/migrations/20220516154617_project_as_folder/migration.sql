/*
  Warnings:

  - You are about to drop the `_ProjectToTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ProjectToTicket` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `project` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ProjectToTag" DROP CONSTRAINT "_ProjectToTag_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProjectToTag" DROP CONSTRAINT "_ProjectToTag_B_fkey";

-- DropForeignKey
ALTER TABLE "_ProjectToTicket" DROP CONSTRAINT "_ProjectToTicket_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProjectToTicket" DROP CONSTRAINT "_ProjectToTicket_B_fkey";

-- DropForeignKey
ALTER TABLE "project" DROP CONSTRAINT "project_authorId_fkey";

-- DropForeignKey
ALTER TABLE "project" DROP CONSTRAINT "project_folderId_fkey";

-- DropForeignKey
ALTER TABLE "project" DROP CONSTRAINT "project_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "project" DROP CONSTRAINT "project_ownerId_fkey";

-- AlterTable
ALTER TABLE "folder" ADD COLUMN     "authorId" INTEGER,
ADD COLUMN     "description" VARCHAR,
ADD COLUMN     "isProject" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ownerId" INTEGER,
ADD COLUMN     "title" VARCHAR;

-- DropTable
DROP TABLE "_ProjectToTag";

-- DropTable
DROP TABLE "_ProjectToTicket";

-- DropTable
DROP TABLE "project";

-- AddForeignKey
ALTER TABLE "folder" ADD CONSTRAINT "folder_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folder" ADD CONSTRAINT "folder_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

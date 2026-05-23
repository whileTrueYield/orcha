/*
  Warnings:

  - You are about to drop the column `userId` on the `organization_upload` table. All the data in the column will be lost.
  - You are about to drop the column `about` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `avatarUrl` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `coverUrl` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `timeZone` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `user_upload` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `roleId` to the `organization_upload` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "organization_upload" DROP CONSTRAINT "organization_upload_userId_fkey";

-- DropForeignKey
ALTER TABLE "user_upload" DROP CONSTRAINT "user_upload_userId_fkey";

-- AlterTable
ALTER TABLE "organization" ADD COLUMN     "preferences" VARCHAR NOT NULL DEFAULT E'{}';

-- AlterTable
ALTER TABLE "organization_upload" DROP COLUMN "userId",
ADD COLUMN     "roleId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "role" ADD COLUMN     "preferences" VARCHAR NOT NULL DEFAULT E'{}';

-- AlterTable
ALTER TABLE "user" DROP COLUMN "about",
DROP COLUMN "avatarUrl",
DROP COLUMN "coverUrl",
DROP COLUMN "name",
DROP COLUMN "timeZone",
ADD COLUMN     "preferences" VARCHAR NOT NULL DEFAULT E'{}';

-- DropTable
DROP TABLE "user_upload";

-- AddForeignKey
ALTER TABLE "organization_upload" ADD CONSTRAINT "organization_upload_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

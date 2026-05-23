/*
  Warnings:

  - You are about to drop the `comment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "comment" DROP CONSTRAINT "comment_authorId_fkey";

-- DropForeignKey
ALTER TABLE "comment" DROP CONSTRAINT "comment_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "comment" DROP CONSTRAINT "comment_ticketId_fkey";

-- DropTable
DROP TABLE "comment";

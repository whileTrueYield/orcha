/*
  Warnings:

  - You are about to drop the column `fixedCycle` on the `page` table. All the data in the column will be lost.
  - You are about to drop the column `startAt` on the `page` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "page" DROP COLUMN "fixedCycle",
DROP COLUMN "startAt";

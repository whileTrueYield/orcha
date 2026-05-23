/*
  Warnings:

  - You are about to drop the `_PageGoals` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_PageGoals" DROP CONSTRAINT "_PageGoals_A_fkey";

-- DropForeignKey
ALTER TABLE "_PageGoals" DROP CONSTRAINT "_PageGoals_B_fkey";

-- AlterTable
ALTER TABLE "page" ADD COLUMN     "paths" VARCHAR NOT NULL DEFAULT E'[]';

-- DropTable
DROP TABLE "_PageGoals";

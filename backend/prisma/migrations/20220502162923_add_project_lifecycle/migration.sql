/*
  Warnings:

  - You are about to drop the column `groupPosition` on the `ticket` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "project" ADD COLUMN     "deadline" TIMESTAMPTZ(6),
ADD COLUMN     "stage" "ModelStage" NOT NULL DEFAULT E'DRAFT';

-- AlterTable
ALTER TABLE "ticket" DROP COLUMN "groupPosition";

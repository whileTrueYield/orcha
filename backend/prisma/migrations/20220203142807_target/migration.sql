/*
  Warnings:

  - Changed the type of `target` on the `notification` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "NotificationTarget" AS ENUM ('TICKET', 'PROJECT', 'QUESTION', 'REPLY');

-- AlterTable
ALTER TABLE "notification" ADD COLUMN     "ancestry" TEXT,
DROP COLUMN "target",
ADD COLUMN     "target" "NotificationTarget" NOT NULL;

-- DropEnum
DROP TYPE "Target";

-- CreateIndex
CREATE INDEX "notification_target_targetId_category_idx" ON "notification"("target", "targetId", "category");

/*
  Warnings:

  - Added the required column `actorId` to the `notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "notification" ADD COLUMN     "actorId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

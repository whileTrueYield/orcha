/*
  Warnings:

  - Added the required column `duration` to the `page` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fixedCyle` to the `page` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerId` to the `page` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startAt` to the `page` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "page" ADD COLUMN     "duration" INTEGER NOT NULL,
ADD COLUMN     "fixedCyle" BOOLEAN NOT NULL,
ADD COLUMN     "ownerId" INTEGER NOT NULL,
ADD COLUMN     "startAt" TIMESTAMPTZ(6) NOT NULL;

-- AlterTable
ALTER TABLE "ticket" ADD COLUMN     "closedAt" TIMESTAMPTZ(6),
ADD COLUMN     "scheduledAt" TIMESTAMPTZ(6);

-- AddForeignKey
ALTER TABLE "page" ADD CONSTRAINT "page_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

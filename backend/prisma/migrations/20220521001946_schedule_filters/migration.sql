/*
  Warnings:

  - You are about to drop the column `schedulePriorityId` on the `schedule_priority_filter` table. All the data in the column will be lost.
  - You are about to drop the `_SchedulePriorityToTicket` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `schedule_priority` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `organizationId` to the `schedule_priority_filter` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_SchedulePriorityToTicket" DROP CONSTRAINT "_SchedulePriorityToTicket_A_fkey";

-- DropForeignKey
ALTER TABLE "_SchedulePriorityToTicket" DROP CONSTRAINT "_SchedulePriorityToTicket_B_fkey";

-- DropForeignKey
ALTER TABLE "schedule_priority" DROP CONSTRAINT "schedule_priority_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "schedule_priority_filter" DROP CONSTRAINT "schedule_priority_filter_schedulePriorityId_fkey";

-- AlterTable
ALTER TABLE "schedule_priority_filter" DROP COLUMN "schedulePriorityId",
ADD COLUMN     "organizationId" INTEGER NOT NULL,
ADD COLUMN     "paths" VARCHAR NOT NULL DEFAULT E'[]';

-- DropTable
DROP TABLE "_SchedulePriorityToTicket";

-- DropTable
DROP TABLE "schedule_priority";

-- CreateTable
CREATE TABLE "_SchedulePriorityFilterToTicket" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_SchedulePriorityFilterToTicket_AB_unique" ON "_SchedulePriorityFilterToTicket"("A", "B");

-- CreateIndex
CREATE INDEX "_SchedulePriorityFilterToTicket_B_index" ON "_SchedulePriorityFilterToTicket"("B");

-- AddForeignKey
ALTER TABLE "schedule_priority_filter" ADD CONSTRAINT "schedule_priority_filter_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SchedulePriorityFilterToTicket" ADD FOREIGN KEY ("A") REFERENCES "schedule_priority_filter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SchedulePriorityFilterToTicket" ADD FOREIGN KEY ("B") REFERENCES "ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the `_FeatureToSchedulePriorityFilter` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ProductToSchedulePriorityFilter` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_SchedulePriorityFilterToTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_SchedulePriorityFilterToTicket` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_SchedulePriorityFilterToWorkflow` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `schedule_priority_filter` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_FeatureToSchedulePriorityFilter" DROP CONSTRAINT "_FeatureToSchedulePriorityFilter_A_fkey";

-- DropForeignKey
ALTER TABLE "_FeatureToSchedulePriorityFilter" DROP CONSTRAINT "_FeatureToSchedulePriorityFilter_B_fkey";

-- DropForeignKey
ALTER TABLE "_ProductToSchedulePriorityFilter" DROP CONSTRAINT "_ProductToSchedulePriorityFilter_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProductToSchedulePriorityFilter" DROP CONSTRAINT "_ProductToSchedulePriorityFilter_B_fkey";

-- DropForeignKey
ALTER TABLE "_SchedulePriorityFilterToTag" DROP CONSTRAINT "_SchedulePriorityFilterToTag_A_fkey";

-- DropForeignKey
ALTER TABLE "_SchedulePriorityFilterToTag" DROP CONSTRAINT "_SchedulePriorityFilterToTag_B_fkey";

-- DropForeignKey
ALTER TABLE "_SchedulePriorityFilterToTicket" DROP CONSTRAINT "_SchedulePriorityFilterToTicket_A_fkey";

-- DropForeignKey
ALTER TABLE "_SchedulePriorityFilterToTicket" DROP CONSTRAINT "_SchedulePriorityFilterToTicket_B_fkey";

-- DropForeignKey
ALTER TABLE "_SchedulePriorityFilterToWorkflow" DROP CONSTRAINT "_SchedulePriorityFilterToWorkflow_A_fkey";

-- DropForeignKey
ALTER TABLE "_SchedulePriorityFilterToWorkflow" DROP CONSTRAINT "_SchedulePriorityFilterToWorkflow_B_fkey";

-- DropForeignKey
ALTER TABLE "schedule_priority_filter" DROP CONSTRAINT "schedule_priority_filter_organizationId_fkey";

-- DropTable
DROP TABLE "_FeatureToSchedulePriorityFilter";

-- DropTable
DROP TABLE "_ProductToSchedulePriorityFilter";

-- DropTable
DROP TABLE "_SchedulePriorityFilterToTag";

-- DropTable
DROP TABLE "_SchedulePriorityFilterToTicket";

-- DropTable
DROP TABLE "_SchedulePriorityFilterToWorkflow";

-- DropTable
DROP TABLE "schedule_priority_filter";

-- CreateTable
CREATE TABLE "schedule_config" (
    "id" SERIAL NOT NULL,
    "priority" INTEGER NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "paths" VARCHAR NOT NULL DEFAULT E'[]',

    CONSTRAINT "schedule_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_FeatureToScheduleConfig" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ProductToScheduleConfig" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ScheduleConfigToTag" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ScheduleConfigToWorkflow" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ScheduleConfigToTicket" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_FeatureToScheduleConfig_AB_unique" ON "_FeatureToScheduleConfig"("A", "B");

-- CreateIndex
CREATE INDEX "_FeatureToScheduleConfig_B_index" ON "_FeatureToScheduleConfig"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ProductToScheduleConfig_AB_unique" ON "_ProductToScheduleConfig"("A", "B");

-- CreateIndex
CREATE INDEX "_ProductToScheduleConfig_B_index" ON "_ProductToScheduleConfig"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ScheduleConfigToTag_AB_unique" ON "_ScheduleConfigToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_ScheduleConfigToTag_B_index" ON "_ScheduleConfigToTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ScheduleConfigToWorkflow_AB_unique" ON "_ScheduleConfigToWorkflow"("A", "B");

-- CreateIndex
CREATE INDEX "_ScheduleConfigToWorkflow_B_index" ON "_ScheduleConfigToWorkflow"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ScheduleConfigToTicket_AB_unique" ON "_ScheduleConfigToTicket"("A", "B");

-- CreateIndex
CREATE INDEX "_ScheduleConfigToTicket_B_index" ON "_ScheduleConfigToTicket"("B");

-- AddForeignKey
ALTER TABLE "schedule_config" ADD CONSTRAINT "schedule_config_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FeatureToScheduleConfig" ADD FOREIGN KEY ("A") REFERENCES "feature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FeatureToScheduleConfig" ADD FOREIGN KEY ("B") REFERENCES "schedule_config"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToScheduleConfig" ADD FOREIGN KEY ("A") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToScheduleConfig" ADD FOREIGN KEY ("B") REFERENCES "schedule_config"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ScheduleConfigToTag" ADD FOREIGN KEY ("A") REFERENCES "schedule_config"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ScheduleConfigToTag" ADD FOREIGN KEY ("B") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ScheduleConfigToWorkflow" ADD FOREIGN KEY ("A") REFERENCES "schedule_config"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ScheduleConfigToWorkflow" ADD FOREIGN KEY ("B") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ScheduleConfigToTicket" ADD FOREIGN KEY ("A") REFERENCES "schedule_config"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ScheduleConfigToTicket" ADD FOREIGN KEY ("B") REFERENCES "ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

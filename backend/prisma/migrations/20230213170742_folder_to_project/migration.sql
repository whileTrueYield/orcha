/*
  Warnings:

  - You are about to drop the column `paths` on the `schedule_config` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "schedule_config" DROP COLUMN "paths";

-- AlterTable
ALTER TABLE "ticket" ADD COLUMN     "projectId" INTEGER;

-- CreateTable
CREATE TABLE "project" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL DEFAULT '',
    "duration" INTEGER NOT NULL DEFAULT 14,
    "checklist" VARCHAR NOT NULL DEFAULT '[]',
    "organizationId" INTEGER NOT NULL,
    "description" VARCHAR,
    "ownerId" INTEGER,
    "authorId" INTEGER,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "parentId" INTEGER,

    CONSTRAINT "project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_datablock" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "projectId" INTEGER,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "project_datablock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PinnedProjects" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ProjectToScheduleConfig" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE INDEX "project_organizationId_idx" ON "project"("organizationId");

-- CreateIndex
CREATE INDEX "project_ownerId_idx" ON "project"("ownerId");

-- CreateIndex
CREATE INDEX "project_authorId_idx" ON "project"("authorId");

-- CreateIndex
CREATE INDEX "project_createdAt_idx" ON "project"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "uniq_project_name_per_parent_and_organization" ON "project"("organizationId", "name", "parentId");

-- CreateIndex
CREATE INDEX "project_datablock_projectId_idx" ON "project_datablock"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "_PinnedProjects_AB_unique" ON "_PinnedProjects"("A", "B");

-- CreateIndex
CREATE INDEX "_PinnedProjects_B_index" ON "_PinnedProjects"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ProjectToScheduleConfig_AB_unique" ON "_ProjectToScheduleConfig"("A", "B");

-- CreateIndex
CREATE INDEX "_ProjectToScheduleConfig_B_index" ON "_ProjectToScheduleConfig"("B");

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_datablock" ADD CONSTRAINT "project_datablock_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PinnedProjects" ADD CONSTRAINT "_PinnedProjects_A_fkey" FOREIGN KEY ("A") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PinnedProjects" ADD CONSTRAINT "_PinnedProjects_B_fkey" FOREIGN KEY ("B") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectToScheduleConfig" ADD CONSTRAINT "_ProjectToScheduleConfig_A_fkey" FOREIGN KEY ("A") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectToScheduleConfig" ADD CONSTRAINT "_ProjectToScheduleConfig_B_fkey" FOREIGN KEY ("B") REFERENCES "schedule_config"("id") ON DELETE CASCADE ON UPDATE CASCADE;

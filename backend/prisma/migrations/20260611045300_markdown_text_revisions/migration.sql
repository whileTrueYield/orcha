/*
  Warnings:

  - You are about to drop the column `bytes` on the `DocumentationPageText` table. All the data in the column will be lost.
  - You are about to drop the column `bytes` on the `ProjectData` table. All the data in the column will be lost.
  - You are about to drop the column `bytes` on the `ProjectText` table. All the data in the column will be lost.
  - You are about to drop the column `bytes` on the `TicketText` table. All the data in the column will be lost.
  - You are about to drop the column `bytes` on the `documentation_page_data` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DocumentationPageText" DROP COLUMN "bytes",
ADD COLUMN     "markdown" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ProjectData" DROP COLUMN "bytes";

-- AlterTable
ALTER TABLE "ProjectText" DROP COLUMN "bytes",
ADD COLUMN     "markdown" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "TicketText" DROP COLUMN "bytes",
ADD COLUMN     "markdown" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "_BackupTeam" ADD CONSTRAINT "_BackupTeam_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_BackupTeam_AB_unique";

-- AlterTable
ALTER TABLE "_BlackoutTimeToRole" ADD CONSTRAINT "_BlackoutTimeToRole_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_BlackoutTimeToRole_AB_unique";

-- AlterTable
ALTER TABLE "_FeatureToPage" ADD CONSTRAINT "_FeatureToPage_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_FeatureToPage_AB_unique";

-- AlterTable
ALTER TABLE "_FeatureToScheduleConfig" ADD CONSTRAINT "_FeatureToScheduleConfig_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_FeatureToScheduleConfig_AB_unique";

-- AlterTable
ALTER TABLE "_FeatureToTicket" ADD CONSTRAINT "_FeatureToTicket_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_FeatureToTicket_AB_unique";

-- AlterTable
ALTER TABLE "_PageTags" ADD CONSTRAINT "_PageTags_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_PageTags_AB_unique";

-- AlterTable
ALTER TABLE "_PageToProduct" ADD CONSTRAINT "_PageToProduct_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_PageToProduct_AB_unique";

-- AlterTable
ALTER TABLE "_PageToRole" ADD CONSTRAINT "_PageToRole_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_PageToRole_AB_unique";

-- AlterTable
ALTER TABLE "_PageToWorkflow" ADD CONSTRAINT "_PageToWorkflow_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_PageToWorkflow_AB_unique";

-- AlterTable
ALTER TABLE "_PersonalTagToTicket" ADD CONSTRAINT "_PersonalTagToTicket_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_PersonalTagToTicket_AB_unique";

-- AlterTable
ALTER TABLE "_PinnedFolders" ADD CONSTRAINT "_PinnedFolders_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_PinnedFolders_AB_unique";

-- AlterTable
ALTER TABLE "_PinnedProjects" ADD CONSTRAINT "_PinnedProjects_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_PinnedProjects_AB_unique";

-- AlterTable
ALTER TABLE "_PrimaryTeam" ADD CONSTRAINT "_PrimaryTeam_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_PrimaryTeam_AB_unique";

-- AlterTable
ALTER TABLE "_ProductToScheduleConfig" ADD CONSTRAINT "_ProductToScheduleConfig_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ProductToScheduleConfig_AB_unique";

-- AlterTable
ALTER TABLE "_ProductToWorkflow" ADD CONSTRAINT "_ProductToWorkflow_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ProductToWorkflow_AB_unique";

-- AlterTable
ALTER TABLE "_ProjectToScheduleConfig" ADD CONSTRAINT "_ProjectToScheduleConfig_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ProjectToScheduleConfig_AB_unique";

-- AlterTable
ALTER TABLE "_RecurringBlackoutTimeToRole" ADD CONSTRAINT "_RecurringBlackoutTimeToRole_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_RecurringBlackoutTimeToRole_AB_unique";

-- AlterTable
ALTER TABLE "_RoleToTeam" ADD CONSTRAINT "_RoleToTeam_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_RoleToTeam_AB_unique";

-- AlterTable
ALTER TABLE "_ScheduleConfigToTag" ADD CONSTRAINT "_ScheduleConfigToTag_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ScheduleConfigToTag_AB_unique";

-- AlterTable
ALTER TABLE "_ScheduleConfigToTicket" ADD CONSTRAINT "_ScheduleConfigToTicket_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ScheduleConfigToTicket_AB_unique";

-- AlterTable
ALTER TABLE "_ScheduleConfigToWorkflow" ADD CONSTRAINT "_ScheduleConfigToWorkflow_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ScheduleConfigToWorkflow_AB_unique";

-- AlterTable
ALTER TABLE "_TagToTicket" ADD CONSTRAINT "_TagToTicket_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_TagToTicket_AB_unique";

-- AlterTable
ALTER TABLE "_TicketAncestry" ADD CONSTRAINT "_TicketAncestry_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_TicketAncestry_AB_unique";

-- AlterTable
ALTER TABLE "_WatchedTicket" ADD CONSTRAINT "_WatchedTicket_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_WatchedTicket_AB_unique";

-- AlterTable
ALTER TABLE "_primaryFeatureFilter" ADD CONSTRAINT "_primaryFeatureFilter_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_primaryFeatureFilter_AB_unique";

-- AlterTable
ALTER TABLE "_primaryProductFilter" ADD CONSTRAINT "_primaryProductFilter_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_primaryProductFilter_AB_unique";

-- AlterTable
ALTER TABLE "_primaryReportQueryAssignees" ADD CONSTRAINT "_primaryReportQueryAssignees_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_primaryReportQueryAssignees_AB_unique";

-- AlterTable
ALTER TABLE "_primaryReportQueryAuthors" ADD CONSTRAINT "_primaryReportQueryAuthors_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_primaryReportQueryAuthors_AB_unique";

-- AlterTable
ALTER TABLE "_primaryReportQueryOwners" ADD CONSTRAINT "_primaryReportQueryOwners_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_primaryReportQueryOwners_AB_unique";

-- AlterTable
ALTER TABLE "_primaryReportQueryWorkflowStateAssignees" ADD CONSTRAINT "_primaryReportQueryWorkflowStateAssignees_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_primaryReportQueryWorkflowStateAssignees_AB_unique";

-- AlterTable
ALTER TABLE "_primaryTagFilter" ADD CONSTRAINT "_primaryTagFilter_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_primaryTagFilter_AB_unique";

-- AlterTable
ALTER TABLE "_primaryTicketFilter" ADD CONSTRAINT "_primaryTicketFilter_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_primaryTicketFilter_AB_unique";

-- AlterTable
ALTER TABLE "_primaryWorkflowFilter" ADD CONSTRAINT "_primaryWorkflowFilter_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_primaryWorkflowFilter_AB_unique";

-- AlterTable
ALTER TABLE "_primaryWorkflowStateFilter" ADD CONSTRAINT "_primaryWorkflowStateFilter_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_primaryWorkflowStateFilter_AB_unique";

-- AlterTable
ALTER TABLE "_secondaryFeatureFilter" ADD CONSTRAINT "_secondaryFeatureFilter_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_secondaryFeatureFilter_AB_unique";

-- AlterTable
ALTER TABLE "_secondaryProductFilter" ADD CONSTRAINT "_secondaryProductFilter_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_secondaryProductFilter_AB_unique";

-- AlterTable
ALTER TABLE "_secondaryReportQueryAssignees" ADD CONSTRAINT "_secondaryReportQueryAssignees_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_secondaryReportQueryAssignees_AB_unique";

-- AlterTable
ALTER TABLE "_secondaryReportQueryAuthors" ADD CONSTRAINT "_secondaryReportQueryAuthors_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_secondaryReportQueryAuthors_AB_unique";

-- AlterTable
ALTER TABLE "_secondaryReportQueryOwners" ADD CONSTRAINT "_secondaryReportQueryOwners_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_secondaryReportQueryOwners_AB_unique";

-- AlterTable
ALTER TABLE "_secondaryReportQueryWorkflowStateAssignees" ADD CONSTRAINT "_secondaryReportQueryWorkflowStateAssignees_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_secondaryReportQueryWorkflowStateAssignees_AB_unique";

-- AlterTable
ALTER TABLE "_secondaryTagFilter" ADD CONSTRAINT "_secondaryTagFilter_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_secondaryTagFilter_AB_unique";

-- AlterTable
ALTER TABLE "_secondaryTicketFilter" ADD CONSTRAINT "_secondaryTicketFilter_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_secondaryTicketFilter_AB_unique";

-- AlterTable
ALTER TABLE "_secondaryWorkflowFilter" ADD CONSTRAINT "_secondaryWorkflowFilter_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_secondaryWorkflowFilter_AB_unique";

-- AlterTable
ALTER TABLE "_secondaryWorkflowStateFilter" ADD CONSTRAINT "_secondaryWorkflowStateFilter_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_secondaryWorkflowStateFilter_AB_unique";

-- AlterTable
ALTER TABLE "documentation_page_data" DROP COLUMN "bytes";

-- CreateTable
CREATE TABLE "documentation_page_text_revision" (
    "id" SERIAL NOT NULL,
    "documentationPageId" INTEGER NOT NULL,
    "version" INTEGER NOT NULL,
    "markdown" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documentation_page_text_revision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personal_access_token" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "tokenHash" VARCHAR NOT NULL,
    "tokenPrefix" VARCHAR NOT NULL,
    "readOnly" BOOLEAN NOT NULL DEFAULT false,
    "lastUsedAt" TIMESTAMPTZ(6),
    "expiresAt" TIMESTAMPTZ(6),
    "revokedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "roleId" INTEGER NOT NULL,
    "organizationId" INTEGER NOT NULL,

    CONSTRAINT "personal_access_token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_text_revision" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "version" INTEGER NOT NULL,
    "markdown" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_text_revision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_text_revision" (
    "id" SERIAL NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "version" INTEGER NOT NULL,
    "markdown" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_text_revision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "documentation_page_text_revision_documentationPageId_versio_key" ON "documentation_page_text_revision"("documentationPageId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "personal_access_token_tokenHash_key" ON "personal_access_token"("tokenHash");

-- CreateIndex
CREATE INDEX "personal_access_token_tokenHash_idx" ON "personal_access_token"("tokenHash");

-- CreateIndex
CREATE INDEX "personal_access_token_roleId_idx" ON "personal_access_token"("roleId");

-- CreateIndex
CREATE INDEX "personal_access_token_organizationId_idx" ON "personal_access_token"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "project_text_revision_projectId_version_key" ON "project_text_revision"("projectId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "ticket_text_revision_ticketId_version_key" ON "ticket_text_revision"("ticketId", "version");

-- AddForeignKey
ALTER TABLE "documentation_page_text_revision" ADD CONSTRAINT "documentation_page_text_revision_documentationPageId_fkey" FOREIGN KEY ("documentationPageId") REFERENCES "documentation_page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personal_access_token" ADD CONSTRAINT "personal_access_token_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personal_access_token" ADD CONSTRAINT "personal_access_token_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_text_revision" ADD CONSTRAINT "project_text_revision_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_text_revision" ADD CONSTRAINT "ticket_text_revision_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

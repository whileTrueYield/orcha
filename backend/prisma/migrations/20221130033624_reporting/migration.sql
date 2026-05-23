-- CreateEnum
CREATE TYPE "ReportGroupBy" AS ENUM ('PRODUCT', 'WORKFLOW', 'WORKFLOW_STATE', 'TAG', 'ASSIGNEE', 'CREATED_AT', 'ETA', 'CLOSED_AT', 'SCHEDULED_AT', 'WORK_DAY');

-- CreateEnum
CREATE TYPE "ReportAggregateField" AS ENUM ('TICKET_COUNT', 'SUM_HOURS_WORKED');

-- CreateEnum
CREATE TYPE "ReportDateGranularity" AS ENUM ('AUTO', 'DAY', 'WEEK', 'MONTH');

-- CreateEnum
CREATE TYPE "ReportWidgetType" AS ENUM ('COMPARE_THROUGH_TIME', 'VALUES_THROUGH_TIME', 'VALUES_BROKEN_DOWN_NOW', 'VALUES_NOW', 'COMPARE_VALUES_NOW', 'CALENDAR');

-- AlterTable
ALTER TABLE "FeatureFlag" ADD COLUMN     "report" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "folder" ADD COLUMN     "checklist" VARCHAR NOT NULL DEFAULT '[]',
ADD COLUMN     "duration" INTEGER NOT NULL DEFAULT 14;

-- CreateTable
CREATE TABLE "report" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "stage" "ModelStage" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "organizationId" INTEGER NOT NULL,

    CONSTRAINT "report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_query" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "rows" INTEGER NOT NULL DEFAULT 1,
    "cols" INTEGER NOT NULL DEFAULT 1,
    "noUnknowns" BOOLEAN NOT NULL DEFAULT true,
    "cummulative" BOOLEAN NOT NULL DEFAULT false,
    "widgetType" "ReportWidgetType" NOT NULL,
    "aggregateField" "ReportAggregateField" NOT NULL DEFAULT 'TICKET_COUNT',
    "organizationId" INTEGER NOT NULL,
    "reportId" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "fromDate" TEXT,
    "untilDate" TEXT,
    "granularity" "ReportDateGranularity" NOT NULL DEFAULT 'AUTO',
    "chartBy" "ReportGroupBy" NOT NULL DEFAULT 'PRODUCT',
    "chartByLabel" TEXT,
    "groupBy" "ReportGroupBy",
    "groupByLabel" TEXT,
    "byPaths" VARCHAR NOT NULL DEFAULT '[]',
    "isTicketDone" BOOLEAN,
    "isTicketActive" BOOLEAN,
    "isTicketStarted" BOOLEAN,
    "isTicketNotStarted" BOOLEAN,
    "secondaryChartBy" "ReportGroupBy",
    "secondaryChartByLabel" TEXT,
    "secondaryGroupBy" "ReportGroupBy",
    "secondaryGroupByLabel" TEXT,
    "sameAsPrimaryFilter" BOOLEAN NOT NULL DEFAULT true,
    "secondaryIsTicketDone" BOOLEAN,
    "secondaryIsTicketActive" BOOLEAN,
    "secondaryIsTicketStarted" BOOLEAN,
    "secondaryIsTicketNotStarted" BOOLEAN,
    "secondaryByPaths" VARCHAR NOT NULL DEFAULT '[]',

    CONSTRAINT "report_query_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_primaryTagFilter" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_primaryWorkflowFilter" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_primaryTicketFilter" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_primaryReportQueryOwners" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_primaryReportQueryAuthors" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_primaryReportQueryAssignees" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_primaryReportQueryWorkflowStateAssignees" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_primaryWorkflowStateFilter" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_secondaryTagFilter" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_secondaryWorkflowFilter" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_secondaryTicketFilter" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_secondaryReportQueryOwners" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_secondaryReportQueryAuthors" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_secondaryReportQueryAssignees" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_secondaryReportQueryWorkflowStateAssignees" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_secondaryWorkflowStateFilter" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_primaryFeatureFilter" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_secondaryFeatureFilter" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_primaryProductFilter" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_secondaryProductFilter" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE INDEX "report_name_idx" ON "report"("name");

-- CreateIndex
CREATE INDEX "report_createdAt_idx" ON "report"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "_primaryTagFilter_AB_unique" ON "_primaryTagFilter"("A", "B");

-- CreateIndex
CREATE INDEX "_primaryTagFilter_B_index" ON "_primaryTagFilter"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_primaryWorkflowFilter_AB_unique" ON "_primaryWorkflowFilter"("A", "B");

-- CreateIndex
CREATE INDEX "_primaryWorkflowFilter_B_index" ON "_primaryWorkflowFilter"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_primaryTicketFilter_AB_unique" ON "_primaryTicketFilter"("A", "B");

-- CreateIndex
CREATE INDEX "_primaryTicketFilter_B_index" ON "_primaryTicketFilter"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_primaryReportQueryOwners_AB_unique" ON "_primaryReportQueryOwners"("A", "B");

-- CreateIndex
CREATE INDEX "_primaryReportQueryOwners_B_index" ON "_primaryReportQueryOwners"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_primaryReportQueryAuthors_AB_unique" ON "_primaryReportQueryAuthors"("A", "B");

-- CreateIndex
CREATE INDEX "_primaryReportQueryAuthors_B_index" ON "_primaryReportQueryAuthors"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_primaryReportQueryAssignees_AB_unique" ON "_primaryReportQueryAssignees"("A", "B");

-- CreateIndex
CREATE INDEX "_primaryReportQueryAssignees_B_index" ON "_primaryReportQueryAssignees"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_primaryReportQueryWorkflowStateAssignees_AB_unique" ON "_primaryReportQueryWorkflowStateAssignees"("A", "B");

-- CreateIndex
CREATE INDEX "_primaryReportQueryWorkflowStateAssignees_B_index" ON "_primaryReportQueryWorkflowStateAssignees"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_primaryWorkflowStateFilter_AB_unique" ON "_primaryWorkflowStateFilter"("A", "B");

-- CreateIndex
CREATE INDEX "_primaryWorkflowStateFilter_B_index" ON "_primaryWorkflowStateFilter"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_secondaryTagFilter_AB_unique" ON "_secondaryTagFilter"("A", "B");

-- CreateIndex
CREATE INDEX "_secondaryTagFilter_B_index" ON "_secondaryTagFilter"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_secondaryWorkflowFilter_AB_unique" ON "_secondaryWorkflowFilter"("A", "B");

-- CreateIndex
CREATE INDEX "_secondaryWorkflowFilter_B_index" ON "_secondaryWorkflowFilter"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_secondaryTicketFilter_AB_unique" ON "_secondaryTicketFilter"("A", "B");

-- CreateIndex
CREATE INDEX "_secondaryTicketFilter_B_index" ON "_secondaryTicketFilter"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_secondaryReportQueryOwners_AB_unique" ON "_secondaryReportQueryOwners"("A", "B");

-- CreateIndex
CREATE INDEX "_secondaryReportQueryOwners_B_index" ON "_secondaryReportQueryOwners"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_secondaryReportQueryAuthors_AB_unique" ON "_secondaryReportQueryAuthors"("A", "B");

-- CreateIndex
CREATE INDEX "_secondaryReportQueryAuthors_B_index" ON "_secondaryReportQueryAuthors"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_secondaryReportQueryAssignees_AB_unique" ON "_secondaryReportQueryAssignees"("A", "B");

-- CreateIndex
CREATE INDEX "_secondaryReportQueryAssignees_B_index" ON "_secondaryReportQueryAssignees"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_secondaryReportQueryWorkflowStateAssignees_AB_unique" ON "_secondaryReportQueryWorkflowStateAssignees"("A", "B");

-- CreateIndex
CREATE INDEX "_secondaryReportQueryWorkflowStateAssignees_B_index" ON "_secondaryReportQueryWorkflowStateAssignees"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_secondaryWorkflowStateFilter_AB_unique" ON "_secondaryWorkflowStateFilter"("A", "B");

-- CreateIndex
CREATE INDEX "_secondaryWorkflowStateFilter_B_index" ON "_secondaryWorkflowStateFilter"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_primaryFeatureFilter_AB_unique" ON "_primaryFeatureFilter"("A", "B");

-- CreateIndex
CREATE INDEX "_primaryFeatureFilter_B_index" ON "_primaryFeatureFilter"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_secondaryFeatureFilter_AB_unique" ON "_secondaryFeatureFilter"("A", "B");

-- CreateIndex
CREATE INDEX "_secondaryFeatureFilter_B_index" ON "_secondaryFeatureFilter"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_primaryProductFilter_AB_unique" ON "_primaryProductFilter"("A", "B");

-- CreateIndex
CREATE INDEX "_primaryProductFilter_B_index" ON "_primaryProductFilter"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_secondaryProductFilter_AB_unique" ON "_secondaryProductFilter"("A", "B");

-- CreateIndex
CREATE INDEX "_secondaryProductFilter_B_index" ON "_secondaryProductFilter"("B");

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_query" ADD CONSTRAINT "report_query_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_query" ADD CONSTRAINT "report_query_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_primaryTagFilter" ADD CONSTRAINT "_primaryTagFilter_A_fkey" FOREIGN KEY ("A") REFERENCES "report_query"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_primaryTagFilter" ADD CONSTRAINT "_primaryTagFilter_B_fkey" FOREIGN KEY ("B") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_primaryWorkflowFilter" ADD CONSTRAINT "_primaryWorkflowFilter_A_fkey" FOREIGN KEY ("A") REFERENCES "report_query"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_primaryWorkflowFilter" ADD CONSTRAINT "_primaryWorkflowFilter_B_fkey" FOREIGN KEY ("B") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_primaryTicketFilter" ADD CONSTRAINT "_primaryTicketFilter_A_fkey" FOREIGN KEY ("A") REFERENCES "report_query"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_primaryTicketFilter" ADD CONSTRAINT "_primaryTicketFilter_B_fkey" FOREIGN KEY ("B") REFERENCES "ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_primaryReportQueryOwners" ADD CONSTRAINT "_primaryReportQueryOwners_A_fkey" FOREIGN KEY ("A") REFERENCES "report_query"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_primaryReportQueryOwners" ADD CONSTRAINT "_primaryReportQueryOwners_B_fkey" FOREIGN KEY ("B") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_primaryReportQueryAuthors" ADD CONSTRAINT "_primaryReportQueryAuthors_A_fkey" FOREIGN KEY ("A") REFERENCES "report_query"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_primaryReportQueryAuthors" ADD CONSTRAINT "_primaryReportQueryAuthors_B_fkey" FOREIGN KEY ("B") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_primaryReportQueryAssignees" ADD CONSTRAINT "_primaryReportQueryAssignees_A_fkey" FOREIGN KEY ("A") REFERENCES "report_query"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_primaryReportQueryAssignees" ADD CONSTRAINT "_primaryReportQueryAssignees_B_fkey" FOREIGN KEY ("B") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_primaryReportQueryWorkflowStateAssignees" ADD CONSTRAINT "_primaryReportQueryWorkflowStateAssignees_A_fkey" FOREIGN KEY ("A") REFERENCES "report_query"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_primaryReportQueryWorkflowStateAssignees" ADD CONSTRAINT "_primaryReportQueryWorkflowStateAssignees_B_fkey" FOREIGN KEY ("B") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_primaryWorkflowStateFilter" ADD CONSTRAINT "_primaryWorkflowStateFilter_A_fkey" FOREIGN KEY ("A") REFERENCES "report_query"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_primaryWorkflowStateFilter" ADD CONSTRAINT "_primaryWorkflowStateFilter_B_fkey" FOREIGN KEY ("B") REFERENCES "workflow_state"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_secondaryTagFilter" ADD CONSTRAINT "_secondaryTagFilter_A_fkey" FOREIGN KEY ("A") REFERENCES "report_query"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_secondaryTagFilter" ADD CONSTRAINT "_secondaryTagFilter_B_fkey" FOREIGN KEY ("B") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_secondaryWorkflowFilter" ADD CONSTRAINT "_secondaryWorkflowFilter_A_fkey" FOREIGN KEY ("A") REFERENCES "report_query"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_secondaryWorkflowFilter" ADD CONSTRAINT "_secondaryWorkflowFilter_B_fkey" FOREIGN KEY ("B") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_secondaryTicketFilter" ADD CONSTRAINT "_secondaryTicketFilter_A_fkey" FOREIGN KEY ("A") REFERENCES "report_query"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_secondaryTicketFilter" ADD CONSTRAINT "_secondaryTicketFilter_B_fkey" FOREIGN KEY ("B") REFERENCES "ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_secondaryReportQueryOwners" ADD CONSTRAINT "_secondaryReportQueryOwners_A_fkey" FOREIGN KEY ("A") REFERENCES "report_query"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_secondaryReportQueryOwners" ADD CONSTRAINT "_secondaryReportQueryOwners_B_fkey" FOREIGN KEY ("B") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_secondaryReportQueryAuthors" ADD CONSTRAINT "_secondaryReportQueryAuthors_A_fkey" FOREIGN KEY ("A") REFERENCES "report_query"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_secondaryReportQueryAuthors" ADD CONSTRAINT "_secondaryReportQueryAuthors_B_fkey" FOREIGN KEY ("B") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_secondaryReportQueryAssignees" ADD CONSTRAINT "_secondaryReportQueryAssignees_A_fkey" FOREIGN KEY ("A") REFERENCES "report_query"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_secondaryReportQueryAssignees" ADD CONSTRAINT "_secondaryReportQueryAssignees_B_fkey" FOREIGN KEY ("B") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_secondaryReportQueryWorkflowStateAssignees" ADD CONSTRAINT "_secondaryReportQueryWorkflowStateAssignees_A_fkey" FOREIGN KEY ("A") REFERENCES "report_query"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_secondaryReportQueryWorkflowStateAssignees" ADD CONSTRAINT "_secondaryReportQueryWorkflowStateAssignees_B_fkey" FOREIGN KEY ("B") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_secondaryWorkflowStateFilter" ADD CONSTRAINT "_secondaryWorkflowStateFilter_A_fkey" FOREIGN KEY ("A") REFERENCES "report_query"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_secondaryWorkflowStateFilter" ADD CONSTRAINT "_secondaryWorkflowStateFilter_B_fkey" FOREIGN KEY ("B") REFERENCES "workflow_state"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_primaryFeatureFilter" ADD CONSTRAINT "_primaryFeatureFilter_A_fkey" FOREIGN KEY ("A") REFERENCES "feature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_primaryFeatureFilter" ADD CONSTRAINT "_primaryFeatureFilter_B_fkey" FOREIGN KEY ("B") REFERENCES "report_query"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_secondaryFeatureFilter" ADD CONSTRAINT "_secondaryFeatureFilter_A_fkey" FOREIGN KEY ("A") REFERENCES "feature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_secondaryFeatureFilter" ADD CONSTRAINT "_secondaryFeatureFilter_B_fkey" FOREIGN KEY ("B") REFERENCES "report_query"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_primaryProductFilter" ADD CONSTRAINT "_primaryProductFilter_A_fkey" FOREIGN KEY ("A") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_primaryProductFilter" ADD CONSTRAINT "_primaryProductFilter_B_fkey" FOREIGN KEY ("B") REFERENCES "report_query"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_secondaryProductFilter" ADD CONSTRAINT "_secondaryProductFilter_A_fkey" FOREIGN KEY ("A") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_secondaryProductFilter" ADD CONSTRAINT "_secondaryProductFilter_B_fkey" FOREIGN KEY ("B") REFERENCES "report_query"("id") ON DELETE CASCADE ON UPDATE CASCADE;

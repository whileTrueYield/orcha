-- AlterEnum
ALTER TYPE "IssueActionCategory" ADD VALUE 'AUTO_RESOLVED';

-- AlterTable
ALTER TABLE "issue" ADD COLUMN     "resolveAfterDate" TIMESTAMPTZ(6);

-- CreateIndex
CREATE INDEX "issue_resolveAfterDate_status_idx" ON "issue"("resolveAfterDate", "status");

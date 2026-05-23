-- AlterTable
ALTER TABLE "issue" ADD COLUMN     "unread" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "issue_unread_idx" ON "issue"("unread");

-- AlterTable
ALTER TABLE "ticket" ADD COLUMN     "estimating" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "milestone" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "ticket_estimating_idx" ON "ticket"("estimating");

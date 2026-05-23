-- AlterTable
ALTER TABLE "ticket" ADD COLUMN     "foreignId" VARCHAR;

-- CreateIndex
CREATE INDEX "ticket_foreignId_idx" ON "ticket"("foreignId");

-- AlterTable
ALTER TABLE "ticket" ADD COLUMN     "supersededById" INTEGER;

-- CreateIndex
CREATE INDEX "ticket_supersededById_idx" ON "ticket"("supersededById");

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_supersededById_fkey" FOREIGN KEY ("supersededById") REFERENCES "ticket"("id") ON DELETE SET NULL ON UPDATE CASCADE;

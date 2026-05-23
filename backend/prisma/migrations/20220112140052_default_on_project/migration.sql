-- AlterTable
ALTER TABLE "project" ADD COLUMN     "defaultProductId" INTEGER,
ADD COLUMN     "defaultWorkflowId" INTEGER;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_defaultProductId_fkey" FOREIGN KEY ("defaultProductId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_defaultWorkflowId_fkey" FOREIGN KEY ("defaultWorkflowId") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

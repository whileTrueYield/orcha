-- AlterTable
ALTER TABLE "product" ADD COLUMN     "isUsingDefaultWorkflows" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "workflow" ADD COLUMN     "isDefaultWorkflow" BOOLEAN NOT NULL DEFAULT true;

/*
  Warnings:

  - You are about to drop the column `status` on the `workflow_state` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "workflow_state_status_idx";

-- AlterTable
ALTER TABLE "workflow_state" DROP COLUMN "status";

-- DropEnum
DROP TYPE "WorkflowStateStatus";

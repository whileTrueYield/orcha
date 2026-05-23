/*
  Warnings:

  - The values [Ticket] on the enum `EstimateType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EstimateType_new" AS ENUM ('TicketWorkflowState');
ALTER TABLE "Estimate" ALTER COLUMN "type" TYPE "EstimateType_new" USING ("type"::text::"EstimateType_new");
ALTER TYPE "EstimateType" RENAME TO "EstimateType_old";
ALTER TYPE "EstimateType_new" RENAME TO "EstimateType";
DROP TYPE "EstimateType_old";
COMMIT;

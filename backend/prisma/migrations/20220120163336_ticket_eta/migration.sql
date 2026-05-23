-- AlterEnum
ALTER TYPE "EstimateType" ADD VALUE 'Ticket';

-- AlterTable
ALTER TABLE "ticket" ADD COLUMN     "eta" TIMESTAMPTZ(6);

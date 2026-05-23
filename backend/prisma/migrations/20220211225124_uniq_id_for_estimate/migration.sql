-- AlterTable
ALTER TABLE "Estimate" ADD CONSTRAINT "Estimate_pkey" PRIMARY KEY ("id", "epoch", "type", "organizationId");

-- AlterTable
ALTER TABLE "ticket" ADD COLUMN     "archivedAt" TIMESTAMPTZ(6),
ADD COLUMN     "deletedAt" TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "issue" ADD COLUMN     "archived" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "product" ADD COLUMN     "isSupportActive" BOOLEAN NOT NULL DEFAULT false;

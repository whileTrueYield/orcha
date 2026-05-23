-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('SUCCESS', 'FAILURE');

-- AlterTable
ALTER TABLE "job" ADD COLUMN     "status" "JobStatus" NOT NULL DEFAULT E'FAILURE';

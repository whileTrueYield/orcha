/*
  Warnings:

  - You are about to drop the `job` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "job" DROP CONSTRAINT "job_organizationId_fkey";

-- DropTable
DROP TABLE "job";

-- DropEnum
DROP TYPE "JobStatus";

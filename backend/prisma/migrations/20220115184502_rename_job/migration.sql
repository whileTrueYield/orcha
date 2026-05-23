/*
  Warnings:

  - You are about to drop the `schedule_job` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "schedule_job" DROP CONSTRAINT "schedule_job_organizationId_fkey";

-- DropTable
DROP TABLE "schedule_job";

-- CreateTable
CREATE TABLE "job" (
    "id" SERIAL NOT NULL,
    "lastRun" TIMESTAMPTZ(6) NOT NULL,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "jobName" TEXT NOT NULL,
    "organizationId" INTEGER NOT NULL,

    CONSTRAINT "job_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "job_organizationId_idx" ON "job"("organizationId");

-- AddForeignKey
ALTER TABLE "job" ADD CONSTRAINT "job_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

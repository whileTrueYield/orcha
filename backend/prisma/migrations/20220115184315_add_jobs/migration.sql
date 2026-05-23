-- CreateTable
CREATE TABLE "schedule_job" (
    "id" SERIAL NOT NULL,
    "lastRun" TIMESTAMPTZ(6) NOT NULL,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "jobName" TEXT NOT NULL,
    "organizationId" INTEGER NOT NULL,

    CONSTRAINT "schedule_job_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "schedule_job_organizationId_idx" ON "schedule_job"("organizationId");

-- AddForeignKey
ALTER TABLE "schedule_job" ADD CONSTRAINT "schedule_job_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

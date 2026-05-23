-- AlterTable
ALTER TABLE "schedule_item" ADD COLUMN     "autoStarted" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "role_auto_resume" (
    "id" SERIAL NOT NULL,
    "roleId" INTEGER NOT NULL,
    "nextStartNotificationDate" TIMESTAMPTZ(6) NOT NULL,
    "nextStartNotificationOptOut" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "role_auto_resume_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "role_auto_resume_roleId_key" ON "role_auto_resume"("roleId");

-- CreateIndex
CREATE INDEX "role_auto_resume_roleId_idx" ON "role_auto_resume"("roleId");

-- CreateIndex
CREATE INDEX "role_auto_resume_nextStartNotificationDate_nextStartNotific_idx" ON "role_auto_resume"("nextStartNotificationDate", "nextStartNotificationOptOut");

-- AddForeignKey
ALTER TABLE "role_auto_resume" ADD CONSTRAINT "role_auto_resume_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

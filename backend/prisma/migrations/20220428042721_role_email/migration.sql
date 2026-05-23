-- CreateTable
CREATE TABLE "role_email" (
    "id" SERIAL NOT NULL,
    "roleId" INTEGER NOT NULL,
    "nextWorkDayNotificationDate" TIMESTAMPTZ(6) NOT NULL,
    "nextWorkDayNotificationOptOut" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "role_email_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "role_email_roleId_key" ON "role_email"("roleId");

-- CreateIndex
CREATE INDEX "role_email_nextWorkDayNotificationDate_nextWorkDayNotificat_idx" ON "role_email"("nextWorkDayNotificationDate", "nextWorkDayNotificationOptOut");

-- AddForeignKey
ALTER TABLE "role_email" ADD CONSTRAINT "role_email_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

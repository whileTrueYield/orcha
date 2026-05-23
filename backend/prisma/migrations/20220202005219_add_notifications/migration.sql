-- CreateEnum
CREATE TYPE "Target" AS ENUM ('TICKET', 'QUESTION', 'REPLY');

-- CreateEnum
CREATE TYPE "NotificationCategory" AS ENUM ('MENTION');

-- CreateTable
CREATE TABLE "notification" (
    "id" SERIAL NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT NOT NULL,
    "category" "NotificationCategory" NOT NULL,
    "target" "Target" NOT NULL,
    "targetId" INTEGER NOT NULL,
    "description" TEXT,
    "roleId" INTEGER NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notification_createdAt_idx" ON "notification"("createdAt");

-- CreateIndex
CREATE INDEX "notification_isRead_idx" ON "notification"("isRead");

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

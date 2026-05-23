/*
  Warnings:

  - A unique constraint covering the columns `[localId,organizationId]` on the table `issue` will be added. If there are existing duplicate values, this will fail.
  - Made the column `localId` on table `issue` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "issue_localId_key";

-- AlterTable
ALTER TABLE "issue" ALTER COLUMN "localId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "issue_localId_organizationId_idx" ON "issue"("localId", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "issue_localId_organizationId_key" ON "issue"("localId", "organizationId");

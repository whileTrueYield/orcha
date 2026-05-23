/*
  Warnings:

  - A unique constraint covering the columns `[localId]` on the table `issue` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "issue" ADD COLUMN     "localId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "issue_localId_key" ON "issue"("localId");

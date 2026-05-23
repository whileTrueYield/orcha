/*
  Warnings:

  - You are about to drop the `case` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `case_client_message` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `case_support_message` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "IssueStatus" AS ENUM ('NEW', 'PROCESSING', 'RESOLVED');

-- CreateEnum
CREATE TYPE "IssueActionCategory" AS ENUM ('CLIENT_MESSAGE', 'SUPPORT_MESSAGE', 'CHANGE_STATUS', 'SET_ASSIGNEE');

-- DropForeignKey
ALTER TABLE "case" DROP CONSTRAINT "case_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "case" DROP CONSTRAINT "case_productId_fkey";

-- DropForeignKey
ALTER TABLE "case" DROP CONSTRAINT "case_ticketId_fkey";

-- DropForeignKey
ALTER TABLE "case_client_message" DROP CONSTRAINT "case_client_message_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "case_client_message" DROP CONSTRAINT "case_client_message_supportSupportCaseId_fkey";

-- DropForeignKey
ALTER TABLE "case_support_message" DROP CONSTRAINT "case_support_message_authorId_fkey";

-- DropForeignKey
ALTER TABLE "case_support_message" DROP CONSTRAINT "case_support_message_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "case_support_message" DROP CONSTRAINT "case_support_message_supportSupportCaseId_fkey";

-- DropTable
DROP TABLE "case";

-- DropTable
DROP TABLE "case_client_message";

-- DropTable
DROP TABLE "case_support_message";

-- DropEnum
DROP TYPE "SupportCaseStatus";

-- CreateTable
CREATE TABLE "issue" (
    "id" SERIAL NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "ticketId" INTEGER,
    "productId" INTEGER NOT NULL,
    "assigneeId" INTEGER,
    "email" VARCHAR NOT NULL,
    "url" VARCHAR NOT NULL,
    "metaData" VARCHAR NOT NULL,
    "description" VARCHAR NOT NULL,
    "userAgent" VARCHAR NOT NULL,
    "token" VARCHAR NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "status" "IssueStatus" NOT NULL DEFAULT E'NEW',

    CONSTRAINT "issue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issue_action" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR NOT NULL,
    "body" VARCHAR,
    "category" "IssueActionCategory" NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "issueId" INTEGER NOT NULL,
    "authorId" INTEGER,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "issue_action_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "issue_token_key" ON "issue"("token");

-- CreateIndex
CREATE INDEX "issue_token_idx" ON "issue"("token");

-- AddForeignKey
ALTER TABLE "issue" ADD CONSTRAINT "issue_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue" ADD CONSTRAINT "issue_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue" ADD CONSTRAINT "issue_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue" ADD CONSTRAINT "issue_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "ticket"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue_action" ADD CONSTRAINT "issue_action_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue_action" ADD CONSTRAINT "issue_action_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue_action" ADD CONSTRAINT "issue_action_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

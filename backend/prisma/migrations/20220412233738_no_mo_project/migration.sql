/*
  Warnings:

  - The values [PROJECT] on the enum `NotificationTarget` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `projectGroupId` on the `ticket` table. All the data in the column will be lost.
  - You are about to drop the `project` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `project_group` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `project_phase` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NotificationTarget_new" AS ENUM ('TICKET', 'QUESTION', 'REPLY');
ALTER TABLE "notification" ALTER COLUMN "target" TYPE "NotificationTarget_new" USING ("target"::text::"NotificationTarget_new");
ALTER TYPE "NotificationTarget" RENAME TO "NotificationTarget_old";
ALTER TYPE "NotificationTarget_new" RENAME TO "NotificationTarget";
DROP TYPE "NotificationTarget_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "project" DROP CONSTRAINT "project_assigneeId_fkey";

-- DropForeignKey
ALTER TABLE "project" DROP CONSTRAINT "project_authorId_fkey";

-- DropForeignKey
ALTER TABLE "project" DROP CONSTRAINT "project_defaultProductId_fkey";

-- DropForeignKey
ALTER TABLE "project" DROP CONSTRAINT "project_defaultWorkflowId_fkey";

-- DropForeignKey
ALTER TABLE "project" DROP CONSTRAINT "project_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "project_group" DROP CONSTRAINT "project_group_projectPhaseId_fkey";

-- DropForeignKey
ALTER TABLE "project_phase" DROP CONSTRAINT "project_phase_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ticket" DROP CONSTRAINT "ticket_projectGroupId_fkey";

-- AlterTable
ALTER TABLE "ticket" DROP COLUMN "projectGroupId";

-- DropTable
DROP TABLE "project";

-- DropTable
DROP TABLE "project_group";

-- DropTable
DROP TABLE "project_phase";

-- DropEnum
DROP TYPE "ProjectStatus";

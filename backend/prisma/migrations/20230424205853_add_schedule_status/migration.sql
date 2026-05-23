-- CreateEnum
CREATE TYPE "ScheduleStatus" AS ENUM ('OK', 'BLOCKED', 'ASSIGNEE_DEACTIVATED');

-- AlterTable
ALTER TABLE "organization" ADD COLUMN     "scheduleStatus" "ScheduleStatus" NOT NULL DEFAULT 'OK';

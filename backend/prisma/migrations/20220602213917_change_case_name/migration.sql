/*
  Warnings:

  - The `status` column on the `case` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `supportCaseId` on the `case_client_message` table. All the data in the column will be lost.
  - You are about to drop the column `supportCaseId` on the `case_support_message` table. All the data in the column will be lost.
  - Added the required column `supportSupportCaseId` to the `case_client_message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `supportSupportCaseId` to the `case_support_message` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SupportCaseStatus" AS ENUM ('NEW', 'PROCESSING', 'RESOLVED');

-- DropForeignKey
ALTER TABLE "case_client_message" DROP CONSTRAINT "case_client_message_supportCaseId_fkey";

-- DropForeignKey
ALTER TABLE "case_support_message" DROP CONSTRAINT "case_support_message_supportCaseId_fkey";

-- AlterTable
ALTER TABLE "case" DROP COLUMN "status",
ADD COLUMN     "status" "SupportCaseStatus" NOT NULL DEFAULT E'NEW';

-- AlterTable
ALTER TABLE "case_client_message" DROP COLUMN "supportCaseId",
ADD COLUMN     "supportSupportCaseId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "case_support_message" DROP COLUMN "supportCaseId",
ADD COLUMN     "supportSupportCaseId" INTEGER NOT NULL;

-- DropEnum
DROP TYPE "CaseStatus";

-- AddForeignKey
ALTER TABLE "case_client_message" ADD CONSTRAINT "case_client_message_supportSupportCaseId_fkey" FOREIGN KEY ("supportSupportCaseId") REFERENCES "case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_support_message" ADD CONSTRAINT "case_support_message_supportSupportCaseId_fkey" FOREIGN KEY ("supportSupportCaseId") REFERENCES "case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

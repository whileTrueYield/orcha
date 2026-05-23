-- DropForeignKey
ALTER TABLE "folder" DROP CONSTRAINT "folder_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "question" DROP CONSTRAINT "question_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "skill" DROP CONSTRAINT "skill_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "tag" DROP CONSTRAINT "tag_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "workflow" DROP CONSTRAINT "workflow_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "workflow_state" DROP CONSTRAINT "workflow_state_organizationId_fkey";

-- AddForeignKey
ALTER TABLE "folder" ADD CONSTRAINT "folder_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "question_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "skill" ADD CONSTRAINT "skill_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tag" ADD CONSTRAINT "tag_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "workflow" ADD CONSTRAINT "workflow_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "workflow_state" ADD CONSTRAINT "workflow_state_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

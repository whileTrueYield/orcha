-- DropForeignKey
ALTER TABLE "ProjectData" DROP CONSTRAINT "ProjectData_projectId_fkey";

-- AddForeignKey
ALTER TABLE "ProjectData" ADD CONSTRAINT "ProjectData_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

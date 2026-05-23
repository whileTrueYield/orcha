-- AlterTable
ALTER TABLE "project" ADD COLUMN     "folderId" INTEGER;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

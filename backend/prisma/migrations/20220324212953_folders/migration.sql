-- DropForeignKey
ALTER TABLE "ticket" DROP CONSTRAINT "ticket_workflowId_fkey";

-- AlterTable
ALTER TABLE "page" ADD COLUMN     "path" TEXT;

-- AlterTable
ALTER TABLE "ticket" ADD COLUMN     "folderId" INTEGER,
ADD COLUMN     "ownerId" INTEGER;

-- CreateTable
CREATE TABLE "folder" (
    "id" SERIAL NOT NULL,
    "path" VARCHAR NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "folder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "folder_path_idx" ON "folder"("path");

-- CreateIndex
CREATE INDEX "folder_createdAt_idx" ON "folder"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "uniq_path_per_organization" ON "folder"("organizationId", "path");

-- AddForeignKey
ALTER TABLE "folder" ADD CONSTRAINT "folder_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "folder"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

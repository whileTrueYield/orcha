/*
  Warnings:

  - You are about to drop the `DocumentationDataBlock` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `project_datablock` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DocumentationDataBlock" DROP CONSTRAINT "DocumentationDataBlock_documentationPageId_fkey";

-- DropForeignKey
ALTER TABLE "project_datablock" DROP CONSTRAINT "project_datablock_projectId_fkey";

-- AlterTable
ALTER TABLE "documentation_page" ADD COLUMN     "indexableContent" VARCHAR NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "project" ADD COLUMN     "indexableContent" VARCHAR NOT NULL DEFAULT '';

-- DropTable
DROP TABLE "DocumentationDataBlock";

-- DropTable
DROP TABLE "project_datablock";

-- CreateTable
CREATE TABLE "documentation_page_data" (
    "id" SERIAL NOT NULL,
    "documentationPageId" INTEGER NOT NULL,
    "bytes" BYTEA,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "documentation_page_data_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "documentation_page_data_documentationPageId_key" ON "documentation_page_data"("documentationPageId");

-- AddForeignKey
ALTER TABLE "documentation_page_data" ADD CONSTRAINT "documentation_page_data_documentationPageId_fkey" FOREIGN KEY ("documentationPageId") REFERENCES "documentation_page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

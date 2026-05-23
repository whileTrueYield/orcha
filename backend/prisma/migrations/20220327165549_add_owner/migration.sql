/*
  Warnings:

  - You are about to drop the column `ownerId` on the `page` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "page" DROP CONSTRAINT "page_ownerId_fkey";

-- AlterTable
ALTER TABLE "page" DROP COLUMN "ownerId";

-- CreateTable
CREATE TABLE "_PageToRole" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PageToRole_AB_unique" ON "_PageToRole"("A", "B");

-- CreateIndex
CREATE INDEX "_PageToRole_B_index" ON "_PageToRole"("B");

-- AddForeignKey
ALTER TABLE "_PageToRole" ADD FOREIGN KEY ("A") REFERENCES "page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PageToRole" ADD FOREIGN KEY ("B") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

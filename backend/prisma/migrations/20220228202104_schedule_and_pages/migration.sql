/*
  Warnings:

  - You are about to drop the `PageGoal` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_PageToTag` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PageGoal" DROP CONSTRAINT "PageGoal_pageId_fkey";

-- DropForeignKey
ALTER TABLE "PageGoal" DROP CONSTRAINT "PageGoal_tagId_fkey";

-- DropForeignKey
ALTER TABLE "_PageToTag" DROP CONSTRAINT "_PageToTag_A_fkey";

-- DropForeignKey
ALTER TABLE "_PageToTag" DROP CONSTRAINT "_PageToTag_B_fkey";

-- DropTable
DROP TABLE "PageGoal";

-- DropTable
DROP TABLE "_PageToTag";

-- CreateTable
CREATE TABLE "_PageTags" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_PageGoals" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PageTags_AB_unique" ON "_PageTags"("A", "B");

-- CreateIndex
CREATE INDEX "_PageTags_B_index" ON "_PageTags"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PageGoals_AB_unique" ON "_PageGoals"("A", "B");

-- CreateIndex
CREATE INDEX "_PageGoals_B_index" ON "_PageGoals"("B");

-- AddForeignKey
ALTER TABLE "_PageTags" ADD FOREIGN KEY ("A") REFERENCES "page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PageTags" ADD FOREIGN KEY ("B") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PageGoals" ADD FOREIGN KEY ("A") REFERENCES "page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PageGoals" ADD FOREIGN KEY ("B") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

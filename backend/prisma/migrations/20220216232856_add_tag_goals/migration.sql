/*
  Warnings:

  - You are about to drop the `_PageToTicket` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_PageToTicket" DROP CONSTRAINT "_PageToTicket_A_fkey";

-- DropForeignKey
ALTER TABLE "_PageToTicket" DROP CONSTRAINT "_PageToTicket_B_fkey";

-- DropTable
DROP TABLE "_PageToTicket";

-- CreateTable
CREATE TABLE "PageGoal" (
    "id" SERIAL NOT NULL,
    "tagId" INTEGER NOT NULL,
    "pageId" INTEGER NOT NULL,

    CONSTRAINT "PageGoal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PageGoal_tagId_key" ON "PageGoal"("tagId");

-- AddForeignKey
ALTER TABLE "PageGoal" ADD CONSTRAINT "PageGoal_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageGoal" ADD CONSTRAINT "PageGoal_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "page"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

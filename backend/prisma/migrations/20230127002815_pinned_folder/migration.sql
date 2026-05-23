-- CreateTable
CREATE TABLE "_PinnedFolders" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PinnedFolders_AB_unique" ON "_PinnedFolders"("A", "B");

-- CreateIndex
CREATE INDEX "_PinnedFolders_B_index" ON "_PinnedFolders"("B");

-- AddForeignKey
ALTER TABLE "_PinnedFolders" ADD CONSTRAINT "_PinnedFolders_A_fkey" FOREIGN KEY ("A") REFERENCES "folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PinnedFolders" ADD CONSTRAINT "_PinnedFolders_B_fkey" FOREIGN KEY ("B") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

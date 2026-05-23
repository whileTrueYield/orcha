-- CreateTable
CREATE TABLE "_WatchedTicket" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_WatchedTicket_AB_unique" ON "_WatchedTicket"("A", "B");

-- CreateIndex
CREATE INDEX "_WatchedTicket_B_index" ON "_WatchedTicket"("B");

-- AddForeignKey
ALTER TABLE "_WatchedTicket" ADD FOREIGN KEY ("A") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_WatchedTicket" ADD FOREIGN KEY ("B") REFERENCES "ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "_ProjectToTicket" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ProjectToTicket_AB_unique" ON "_ProjectToTicket"("A", "B");

-- CreateIndex
CREATE INDEX "_ProjectToTicket_B_index" ON "_ProjectToTicket"("B");

-- AddForeignKey
ALTER TABLE "_ProjectToTicket" ADD FOREIGN KEY ("A") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectToTicket" ADD FOREIGN KEY ("B") REFERENCES "ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

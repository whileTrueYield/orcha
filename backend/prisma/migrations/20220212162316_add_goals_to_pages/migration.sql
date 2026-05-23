-- CreateTable
CREATE TABLE "_PageToTicket" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PageToTicket_AB_unique" ON "_PageToTicket"("A", "B");

-- CreateIndex
CREATE INDEX "_PageToTicket_B_index" ON "_PageToTicket"("B");

-- AddForeignKey
ALTER TABLE "_PageToTicket" ADD FOREIGN KEY ("A") REFERENCES "page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PageToTicket" ADD FOREIGN KEY ("B") REFERENCES "ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

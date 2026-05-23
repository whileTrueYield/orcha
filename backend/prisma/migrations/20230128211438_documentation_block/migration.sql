-- CreateTable
CREATE TABLE "DocumentationDataBlock" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "documentationPageId" INTEGER,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "DocumentationDataBlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DocumentationDataBlock_documentationPageId_idx" ON "DocumentationDataBlock"("documentationPageId");

-- AddForeignKey
ALTER TABLE "DocumentationDataBlock" ADD CONSTRAINT "DocumentationDataBlock_documentationPageId_fkey" FOREIGN KEY ("documentationPageId") REFERENCES "documentation_page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

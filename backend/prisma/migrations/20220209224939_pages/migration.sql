-- CreateTable
CREATE TABLE "page" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "organizationId" INTEGER NOT NULL,

    CONSTRAINT "page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_FeatureToPage" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_PageToProduct" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_PageToTag" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_PageToWorkflow" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "page_organizationId_key" ON "page"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "_FeatureToPage_AB_unique" ON "_FeatureToPage"("A", "B");

-- CreateIndex
CREATE INDEX "_FeatureToPage_B_index" ON "_FeatureToPage"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PageToProduct_AB_unique" ON "_PageToProduct"("A", "B");

-- CreateIndex
CREATE INDEX "_PageToProduct_B_index" ON "_PageToProduct"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PageToTag_AB_unique" ON "_PageToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_PageToTag_B_index" ON "_PageToTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PageToWorkflow_AB_unique" ON "_PageToWorkflow"("A", "B");

-- CreateIndex
CREATE INDEX "_PageToWorkflow_B_index" ON "_PageToWorkflow"("B");

-- AddForeignKey
ALTER TABLE "page" ADD CONSTRAINT "page_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "_FeatureToPage" ADD FOREIGN KEY ("A") REFERENCES "feature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FeatureToPage" ADD FOREIGN KEY ("B") REFERENCES "page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PageToProduct" ADD FOREIGN KEY ("A") REFERENCES "page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PageToProduct" ADD FOREIGN KEY ("B") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PageToTag" ADD FOREIGN KEY ("A") REFERENCES "page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PageToTag" ADD FOREIGN KEY ("B") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PageToWorkflow" ADD FOREIGN KEY ("A") REFERENCES "page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PageToWorkflow" ADD FOREIGN KEY ("B") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

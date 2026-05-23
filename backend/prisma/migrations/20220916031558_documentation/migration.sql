-- CreateTable
CREATE TABLE "documentation" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" VARCHAR,
    "stage" "ModelStage" NOT NULL DEFAULT 'DRAFT',
    "logoUrl" VARCHAR,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "lastPublishedAt" TIMESTAMPTZ(6),
    "organizationId" INTEGER NOT NULL,

    CONSTRAINT "documentation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentation_page" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR NOT NULL,
    "body" VARCHAR NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 1,
    "customId" VARCHAR,
    "urls" VARCHAR NOT NULL DEFAULT '[]',
    "keywords" VARCHAR NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "documentationId" INTEGER NOT NULL,
    "parentId" INTEGER,

    CONSTRAINT "documentation_page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentation_page_poi" (
    "id" SERIAL NOT NULL,
    "urls" VARCHAR NOT NULL,
    "keywords" VARCHAR NOT NULL,
    "title" VARCHAR NOT NULL,
    "hashtag" VARCHAR NOT NULL,
    "documentationId" INTEGER NOT NULL,
    "documentationPageId" INTEGER NOT NULL,

    CONSTRAINT "documentation_page_poi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "documentation_name_idx" ON "documentation"("name");

-- CreateIndex
CREATE INDEX "documentation_createdAt_idx" ON "documentation"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "documentation_page_documentationId_customId_key" ON "documentation_page"("documentationId", "customId");

-- CreateIndex
CREATE UNIQUE INDEX "documentation_page_poi_documentationId_hashtag_key" ON "documentation_page_poi"("documentationId", "hashtag");

-- AddForeignKey
ALTER TABLE "documentation" ADD CONSTRAINT "documentation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentation_page" ADD CONSTRAINT "documentation_page_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentation_page" ADD CONSTRAINT "documentation_page_documentationId_fkey" FOREIGN KEY ("documentationId") REFERENCES "documentation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentation_page" ADD CONSTRAINT "documentation_page_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "documentation_page"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentation_page_poi" ADD CONSTRAINT "documentation_page_poi_documentationId_fkey" FOREIGN KEY ("documentationId") REFERENCES "documentation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentation_page_poi" ADD CONSTRAINT "documentation_page_poi_documentationPageId_fkey" FOREIGN KEY ("documentationPageId") REFERENCES "documentation_page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

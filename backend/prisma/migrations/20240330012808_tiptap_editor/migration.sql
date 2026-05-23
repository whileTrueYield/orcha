-- AlterTable
ALTER TABLE "ticket" ADD COLUMN     "indexableContent" VARCHAR NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "DocumentationPageText" (
    "id" SERIAL NOT NULL,
    "documentationPageId" INTEGER NOT NULL,
    "bytes" BYTEA,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "DocumentationPageText_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drawing" (
    "id" SERIAL NOT NULL,
    "data" TEXT NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "roleId" INTEGER,
    "lockExpiration" TIMESTAMP(3),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "drawing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectText" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "bytes" BYTEA,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ProjectText_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketText" (
    "id" SERIAL NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "bytes" BYTEA,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "TicketText_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DocumentationPageText_documentationPageId_key" ON "DocumentationPageText"("documentationPageId");

-- CreateIndex
CREATE INDEX "drawing_organizationId_idx" ON "drawing"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectText_projectId_key" ON "ProjectText"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "TicketText_ticketId_key" ON "TicketText"("ticketId");

-- AddForeignKey
ALTER TABLE "DocumentationPageText" ADD CONSTRAINT "DocumentationPageText_documentationPageId_fkey" FOREIGN KEY ("documentationPageId") REFERENCES "documentation_page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drawing" ADD CONSTRAINT "drawing_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drawing" ADD CONSTRAINT "drawing_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectText" ADD CONSTRAINT "ProjectText_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketText" ADD CONSTRAINT "TicketText_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

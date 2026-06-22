-- CreateEnum
CREATE TYPE "RepositoryLinkStatus" AS ENUM ('PENDING', 'ACTIVE');

-- CreateTable
CREATE TABLE "repository_link" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR,
    "status" "RepositoryLinkStatus" NOT NULL DEFAULT 'PENDING',
    "webhookToken" VARCHAR NOT NULL,
    "webhookSecretEnc" VARCHAR NOT NULL,
    "repoFullName" VARCHAR,
    "activatedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "organizationId" INTEGER NOT NULL,

    CONSTRAINT "repository_link_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "repository_link_webhookToken_key" ON "repository_link"("webhookToken");

-- CreateIndex
CREATE UNIQUE INDEX "repository_link_repoFullName_key" ON "repository_link"("repoFullName");

-- CreateIndex
CREATE INDEX "repository_link_organizationId_idx" ON "repository_link"("organizationId");

-- AddForeignKey
ALTER TABLE "repository_link" ADD CONSTRAINT "repository_link_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('NEW', 'PROCESSING', 'RESOLVED');

-- CreateTable
CREATE TABLE "case" (
    "id" SERIAL NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "ticketId" INTEGER,
    "productId" INTEGER NOT NULL,
    "email" VARCHAR NOT NULL,
    "url" VARCHAR NOT NULL,
    "data" VARCHAR NOT NULL,
    "description" VARCHAR NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "status" "CaseStatus" NOT NULL DEFAULT E'NEW',

    CONSTRAINT "case_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_client_message" (
    "id" SERIAL NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "supportCaseId" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "case_client_message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_support_message" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" INTEGER NOT NULL,
    "supportCaseId" INTEGER NOT NULL,
    "authorId" INTEGER NOT NULL,

    CONSTRAINT "case_support_message_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "case" ADD CONSTRAINT "case_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case" ADD CONSTRAINT "case_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case" ADD CONSTRAINT "case_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "ticket"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_client_message" ADD CONSTRAINT "case_client_message_supportCaseId_fkey" FOREIGN KEY ("supportCaseId") REFERENCES "case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_client_message" ADD CONSTRAINT "case_client_message_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_support_message" ADD CONSTRAINT "case_support_message_supportCaseId_fkey" FOREIGN KEY ("supportCaseId") REFERENCES "case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_support_message" ADD CONSTRAINT "case_support_message_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_support_message" ADD CONSTRAINT "case_support_message_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

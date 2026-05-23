-- AlterTable
ALTER TABLE "documentation" ADD COLUMN     "lastPublishRequestAt" TIMESTAMPTZ(6);

-- CreateTable
CREATE TABLE "FeatureFlag" (
    "id" SERIAL NOT NULL,
    "documentation" BOOLEAN NOT NULL DEFAULT false,
    "support" BOOLEAN NOT NULL DEFAULT false,
    "organizationId" INTEGER NOT NULL,

    CONSTRAINT "FeatureFlag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FeatureFlag_organizationId_key" ON "FeatureFlag"("organizationId");

-- AddForeignKey
ALTER TABLE "FeatureFlag" ADD CONSTRAINT "FeatureFlag_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

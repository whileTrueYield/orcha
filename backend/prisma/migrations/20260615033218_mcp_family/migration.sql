-- AlterTable
ALTER TABLE "oauth_access_token" ADD COLUMN     "familyId" VARCHAR NOT NULL DEFAULT gen_random_uuid();

-- CreateTable
CREATE TABLE "oauth_refresh_token" (
    "id" SERIAL NOT NULL,
    "tokenHash" VARCHAR NOT NULL,
    "familyId" VARCHAR NOT NULL,
    "scope" VARCHAR NOT NULL,
    "readOnly" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "rotatedAt" TIMESTAMPTZ(6),
    "revokedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "clientId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,
    "organizationId" INTEGER NOT NULL,

    CONSTRAINT "oauth_refresh_token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "oauth_refresh_token_tokenHash_key" ON "oauth_refresh_token"("tokenHash");

-- CreateIndex
CREATE INDEX "oauth_refresh_token_tokenHash_idx" ON "oauth_refresh_token"("tokenHash");

-- CreateIndex
CREATE INDEX "oauth_refresh_token_familyId_idx" ON "oauth_refresh_token"("familyId");

-- CreateIndex
CREATE INDEX "oauth_access_token_familyId_idx" ON "oauth_access_token"("familyId");

-- AddForeignKey
ALTER TABLE "oauth_refresh_token" ADD CONSTRAINT "oauth_refresh_token_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "oauth_client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oauth_refresh_token" ADD CONSTRAINT "oauth_refresh_token_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oauth_refresh_token" ADD CONSTRAINT "oauth_refresh_token_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "oauth_client" (
    "id" SERIAL NOT NULL,
    "clientId" VARCHAR NOT NULL,
    "name" VARCHAR,
    "redirectUris" TEXT[],
    "clientIdIssuedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "oauth_client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oauth_authorization_code" (
    "id" SERIAL NOT NULL,
    "codeHash" VARCHAR NOT NULL,
    "codeChallenge" VARCHAR NOT NULL,
    "redirectUri" VARCHAR NOT NULL,
    "scope" VARCHAR NOT NULL,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "consumedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clientId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,
    "organizationId" INTEGER NOT NULL,

    CONSTRAINT "oauth_authorization_code_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oauth_access_token" (
    "id" SERIAL NOT NULL,
    "tokenHash" VARCHAR NOT NULL,
    "scope" VARCHAR NOT NULL,
    "readOnly" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "revokedAt" TIMESTAMPTZ(6),
    "lastUsedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "clientId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,
    "organizationId" INTEGER NOT NULL,

    CONSTRAINT "oauth_access_token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "oauth_client_clientId_key" ON "oauth_client"("clientId");

-- CreateIndex
CREATE INDEX "oauth_client_clientId_idx" ON "oauth_client"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "oauth_authorization_code_codeHash_key" ON "oauth_authorization_code"("codeHash");

-- CreateIndex
CREATE INDEX "oauth_authorization_code_codeHash_idx" ON "oauth_authorization_code"("codeHash");

-- CreateIndex
CREATE UNIQUE INDEX "oauth_access_token_tokenHash_key" ON "oauth_access_token"("tokenHash");

-- CreateIndex
CREATE INDEX "oauth_access_token_tokenHash_idx" ON "oauth_access_token"("tokenHash");

-- CreateIndex
CREATE INDEX "oauth_access_token_roleId_idx" ON "oauth_access_token"("roleId");

-- CreateIndex
CREATE INDEX "oauth_access_token_organizationId_idx" ON "oauth_access_token"("organizationId");

-- AddForeignKey
ALTER TABLE "oauth_authorization_code" ADD CONSTRAINT "oauth_authorization_code_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "oauth_client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oauth_authorization_code" ADD CONSTRAINT "oauth_authorization_code_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oauth_authorization_code" ADD CONSTRAINT "oauth_authorization_code_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oauth_access_token" ADD CONSTRAINT "oauth_access_token_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "oauth_client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oauth_access_token" ADD CONSTRAINT "oauth_access_token_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oauth_access_token" ADD CONSTRAINT "oauth_access_token_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

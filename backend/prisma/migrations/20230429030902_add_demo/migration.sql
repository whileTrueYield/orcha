-- CreateEnum
CREATE TYPE "DemoStatus" AS ENUM ('QUEUED', 'PROCESSING', 'READY', 'FAILED');

-- CreateTable
CREATE TABLE "demo_request" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "ip_address" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "DemoStatus" NOT NULL DEFAULT 'QUEUED',
    "config" TEXT NOT NULL DEFAULT '{}',
    "confirmed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "demo_request_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "demo_request_id_key" ON "demo_request"("id");

-- CreateIndex
CREATE UNIQUE INDEX "demo_request_email_key" ON "demo_request"("email");

-- CreateIndex
CREATE INDEX "demo_request_id_idx" ON "demo_request"("id");

-- CreateIndex
CREATE INDEX "demo_request_email_idx" ON "demo_request"("email");

-- CreateIndex
CREATE INDEX "demo_request_ip_address_idx" ON "demo_request"("ip_address");

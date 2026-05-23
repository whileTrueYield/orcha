-- CreateTable
CREATE TABLE "time_off" (
    "id" SERIAL NOT NULL,
    "startAt" TIMESTAMPTZ(6) NOT NULL,
    "stopAt" TIMESTAMPTZ(6) NOT NULL,
    "roleId" INTEGER NOT NULL,
    "organizationId" INTEGER NOT NULL,

    CONSTRAINT "time_off_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "time_off_startAt_idx" ON "time_off"("startAt");

-- CreateIndex
CREATE INDEX "time_off_stopAt_idx" ON "time_off"("stopAt");

-- AddForeignKey
ALTER TABLE "time_off" ADD CONSTRAINT "time_off_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "time_off" ADD CONSTRAINT "time_off_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

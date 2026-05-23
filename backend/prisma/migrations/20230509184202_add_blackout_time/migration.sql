-- CreateTable
CREATE TABLE "blackout_time" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "startAt" TIMESTAMPTZ(6) NOT NULL,
    "stopAt" TIMESTAMPTZ(6) NOT NULL,
    "disabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "organizationId" INTEGER NOT NULL,

    CONSTRAINT "blackout_time_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recurring_blackout_time" (
    "id" SERIAL NOT NULL,
    "startTime" TEXT NOT NULL,
    "stopTime" TEXT NOT NULL,
    "timeZone" VARCHAR NOT NULL DEFAULT 'Etc/UTC',
    "disabled" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "monday" BOOLEAN NOT NULL DEFAULT false,
    "tuesday" BOOLEAN NOT NULL DEFAULT false,
    "wednesday" BOOLEAN NOT NULL DEFAULT false,
    "thursday" BOOLEAN NOT NULL DEFAULT false,
    "friday" BOOLEAN NOT NULL DEFAULT false,
    "saturday" BOOLEAN NOT NULL DEFAULT false,
    "sunday" BOOLEAN NOT NULL DEFAULT false,
    "organizationId" INTEGER NOT NULL,

    CONSTRAINT "recurring_blackout_time_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BlackoutTimeToRole" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_RecurringBlackoutTimeToRole" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE INDEX "blackout_time_organizationId_idx" ON "blackout_time"("organizationId");

-- CreateIndex
CREATE INDEX "blackout_time_startAt_idx" ON "blackout_time"("startAt");

-- CreateIndex
CREATE INDEX "blackout_time_stopAt_idx" ON "blackout_time"("stopAt");

-- CreateIndex
CREATE INDEX "recurring_blackout_time_organizationId_disabled_idx" ON "recurring_blackout_time"("organizationId", "disabled");

-- CreateIndex
CREATE UNIQUE INDEX "_BlackoutTimeToRole_AB_unique" ON "_BlackoutTimeToRole"("A", "B");

-- CreateIndex
CREATE INDEX "_BlackoutTimeToRole_B_index" ON "_BlackoutTimeToRole"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_RecurringBlackoutTimeToRole_AB_unique" ON "_RecurringBlackoutTimeToRole"("A", "B");

-- CreateIndex
CREATE INDEX "_RecurringBlackoutTimeToRole_B_index" ON "_RecurringBlackoutTimeToRole"("B");

-- AddForeignKey
ALTER TABLE "blackout_time" ADD CONSTRAINT "blackout_time_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_blackout_time" ADD CONSTRAINT "recurring_blackout_time_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BlackoutTimeToRole" ADD CONSTRAINT "_BlackoutTimeToRole_A_fkey" FOREIGN KEY ("A") REFERENCES "blackout_time"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BlackoutTimeToRole" ADD CONSTRAINT "_BlackoutTimeToRole_B_fkey" FOREIGN KEY ("B") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RecurringBlackoutTimeToRole" ADD CONSTRAINT "_RecurringBlackoutTimeToRole_A_fkey" FOREIGN KEY ("A") REFERENCES "recurring_blackout_time"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RecurringBlackoutTimeToRole" ADD CONSTRAINT "_RecurringBlackoutTimeToRole_B_fkey" FOREIGN KEY ("B") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

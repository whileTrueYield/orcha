-- CreateTable
CREATE TABLE "todo" (
    "id" SERIAL NOT NULL,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "body" VARCHAR NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkedAt" TIMESTAMPTZ(6) NOT NULL,
    "dueDate" TIMESTAMPTZ(6) NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "organizationId" INTEGER NOT NULL,

    CONSTRAINT "todo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "todo_organizationId_key" ON "todo"("organizationId");

-- CreateIndex
CREATE INDEX "todo_createdAt_idx" ON "todo"("createdAt");

-- CreateIndex
CREATE INDEX "todo_checkedAt_idx" ON "todo"("checkedAt");

-- CreateIndex
CREATE INDEX "todo_checked_idx" ON "todo"("checked");

-- AddForeignKey
ALTER TABLE "todo" ADD CONSTRAINT "todo_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "todo" ADD CONSTRAINT "todo_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

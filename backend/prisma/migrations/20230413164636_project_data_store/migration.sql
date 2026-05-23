-- CreateTable
CREATE TABLE "ProjectData" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "bytes" BYTEA,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ProjectData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectData_projectId_key" ON "ProjectData"("projectId");

-- AddForeignKey
ALTER TABLE "ProjectData" ADD CONSTRAINT "ProjectData_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

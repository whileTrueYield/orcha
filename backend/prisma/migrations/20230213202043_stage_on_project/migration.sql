-- AlterTable
ALTER TABLE "project" ADD COLUMN     "stage" "ModelStage" NOT NULL DEFAULT 'PUBLISHED';

-- CreateIndex
CREATE INDEX "project_stage_idx" ON "project"("stage");

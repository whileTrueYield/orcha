-- DropForeignKey
ALTER TABLE "skill" DROP CONSTRAINT "skill_featureId_fkey";

-- AddForeignKey
ALTER TABLE "skill" ADD CONSTRAINT "skill_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "feature"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- CreateIndex
CREATE INDEX "notification_target_targetId_category_idx" ON "notification"("target", "targetId", "category");

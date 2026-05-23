-- AlterTable
ALTER TABLE "schedule_item" ADD COLUMN     "extendedAt" TIMESTAMPTZ(6);

-- CreateTable
CREATE TABLE "push_subscription" (
    "id" SERIAL NOT NULL,
    "endpoint" TEXT NOT NULL,
    "expirationTime" TEXT,
    "JSONkeys" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "roleId" INTEGER NOT NULL,

    CONSTRAINT "push_subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_start_reminder" (
    "id" SERIAL NOT NULL,
    "roleId" INTEGER NOT NULL,
    "nextStartNotificationDate" TIMESTAMPTZ(6) NOT NULL,
    "nextStartNotificationOffset" INTEGER NOT NULL DEFAULT 10,
    "nextStartNotificationOptOut" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "role_start_reminder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "push_subscription_roleId_idx" ON "push_subscription"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "push_subscription_endpoint_key" ON "push_subscription"("endpoint");

-- CreateIndex
CREATE UNIQUE INDEX "role_start_reminder_roleId_key" ON "role_start_reminder"("roleId");

-- CreateIndex
CREATE INDEX "role_start_reminder_roleId_idx" ON "role_start_reminder"("roleId");

-- CreateIndex
CREATE INDEX "role_start_reminder_nextStartNotificationDate_nextStartNoti_idx" ON "role_start_reminder"("nextStartNotificationDate", "nextStartNotificationOptOut");

-- CreateIndex
CREATE INDEX "Estimate_organizationId_idx" ON "Estimate"("organizationId");

-- CreateIndex
CREATE INDEX "Estimate_assigneeId_idx" ON "Estimate"("assigneeId");

-- CreateIndex
CREATE INDEX "Estimate_id_idx" ON "Estimate"("id");

-- CreateIndex
CREATE INDEX "Estimate_epoch_idx" ON "Estimate"("epoch");

-- CreateIndex
CREATE INDEX "FeatureFlag_organizationId_idx" ON "FeatureFlag"("organizationId");

-- CreateIndex
CREATE INDEX "FolderDataBlock_folderId_idx" ON "FolderDataBlock"("folderId");

-- CreateIndex
CREATE INDEX "comment_authorId_idx" ON "comment"("authorId");

-- CreateIndex
CREATE INDEX "comment_organizationId_idx" ON "comment"("organizationId");

-- CreateIndex
CREATE INDEX "comment_ticketId_idx" ON "comment"("ticketId");

-- CreateIndex
CREATE INDEX "comment_acceptedReplyId_idx" ON "comment"("acceptedReplyId");

-- CreateIndex
CREATE INDEX "comment_reply_authorId_idx" ON "comment_reply"("authorId");

-- CreateIndex
CREATE INDEX "comment_reply_commentId_idx" ON "comment_reply"("commentId");

-- CreateIndex
CREATE INDEX "comment_reply_organizationId_idx" ON "comment_reply"("organizationId");

-- CreateIndex
CREATE INDEX "documentation_organizationId_idx" ON "documentation"("organizationId");

-- CreateIndex
CREATE INDEX "documentation_page_organizationId_idx" ON "documentation_page"("organizationId");

-- CreateIndex
CREATE INDEX "documentation_page_documentationId_idx" ON "documentation_page"("documentationId");

-- CreateIndex
CREATE INDEX "documentation_page_parentId_idx" ON "documentation_page"("parentId");

-- CreateIndex
CREATE INDEX "documentation_page_poi_documentationId_idx" ON "documentation_page_poi"("documentationId");

-- CreateIndex
CREATE INDEX "documentation_page_poi_documentationPageId_idx" ON "documentation_page_poi"("documentationPageId");

-- CreateIndex
CREATE INDEX "feature_featureGroupId_idx" ON "feature"("featureGroupId");

-- CreateIndex
CREATE INDEX "feature_group_organizationId_idx" ON "feature_group"("organizationId");

-- CreateIndex
CREATE INDEX "feature_group_productId_idx" ON "feature_group"("productId");

-- CreateIndex
CREATE INDEX "folder_organizationId_idx" ON "folder"("organizationId");

-- CreateIndex
CREATE INDEX "folder_ownerId_idx" ON "folder"("ownerId");

-- CreateIndex
CREATE INDEX "folder_authorId_idx" ON "folder"("authorId");

-- CreateIndex
CREATE INDEX "issue_organizationId_idx" ON "issue"("organizationId");

-- CreateIndex
CREATE INDEX "issue_ticketId_idx" ON "issue"("ticketId");

-- CreateIndex
CREATE INDEX "issue_productId_idx" ON "issue"("productId");

-- CreateIndex
CREATE INDEX "issue_assigneeId_idx" ON "issue"("assigneeId");

-- CreateIndex
CREATE INDEX "issue_action_organizationId_idx" ON "issue_action"("organizationId");

-- CreateIndex
CREATE INDEX "issue_action_issueId_idx" ON "issue_action"("issueId");

-- CreateIndex
CREATE INDEX "issue_action_authorId_idx" ON "issue_action"("authorId");

-- CreateIndex
CREATE INDEX "note_ownerId_idx" ON "note"("ownerId");

-- CreateIndex
CREATE INDEX "note_organizationId_idx" ON "note"("organizationId");

-- CreateIndex
CREATE INDEX "notification_roleId_idx" ON "notification"("roleId");

-- CreateIndex
CREATE INDEX "notification_actorId_idx" ON "notification"("actorId");

-- CreateIndex
CREATE INDEX "notification_organizationId_idx" ON "notification"("organizationId");

-- CreateIndex
CREATE INDEX "organization_mailingAddressId_idx" ON "organization"("mailingAddressId");

-- CreateIndex
CREATE INDEX "organization_billingAddressId_idx" ON "organization"("billingAddressId");

-- CreateIndex
CREATE INDEX "organization_address_organizationId_idx" ON "organization_address"("organizationId");

-- CreateIndex
CREATE INDEX "organization_upload_organizationId_idx" ON "organization_upload"("organizationId");

-- CreateIndex
CREATE INDEX "organization_upload_roleId_idx" ON "organization_upload"("roleId");

-- CreateIndex
CREATE INDEX "page_organizationId_idx" ON "page"("organizationId");

-- CreateIndex
CREATE INDEX "personal_tag_organizationId_idx" ON "personal_tag"("organizationId");

-- CreateIndex
CREATE INDEX "personal_tag_ownerId_idx" ON "personal_tag"("ownerId");

-- CreateIndex
CREATE INDEX "personal_tag_replacedByTagId_idx" ON "personal_tag"("replacedByTagId");

-- CreateIndex
CREATE INDEX "product_organizationId_idx" ON "product"("organizationId");

-- CreateIndex
CREATE INDEX "question_authorId_idx" ON "question"("authorId");

-- CreateIndex
CREATE INDEX "question_organizationId_idx" ON "question"("organizationId");

-- CreateIndex
CREATE INDEX "question_ticketId_idx" ON "question"("ticketId");

-- CreateIndex
CREATE INDEX "question_acceptedReplyId_idx" ON "question"("acceptedReplyId");

-- CreateIndex
CREATE INDEX "question_reply_organizationId_idx" ON "question_reply"("organizationId");

-- CreateIndex
CREATE INDEX "question_reply_questionId_idx" ON "question_reply"("questionId");

-- CreateIndex
CREATE INDEX "question_reply_authorId_idx" ON "question_reply"("authorId");

-- CreateIndex
CREATE INDEX "report_organizationId_idx" ON "report"("organizationId");

-- CreateIndex
CREATE INDEX "report_query_organizationId_idx" ON "report_query"("organizationId");

-- CreateIndex
CREATE INDEX "report_query_reportId_idx" ON "report_query"("reportId");

-- CreateIndex
CREATE INDEX "role_userId_idx" ON "role"("userId");

-- CreateIndex
CREATE INDEX "role_organizationId_idx" ON "role"("organizationId");

-- CreateIndex
CREATE INDEX "role_email_roleId_idx" ON "role_email"("roleId");

-- CreateIndex
CREATE INDEX "schedule_config_organizationId_idx" ON "schedule_config"("organizationId");

-- CreateIndex
CREATE INDEX "schedule_item_ticketWorkflowStateId_idx" ON "schedule_item"("ticketWorkflowStateId");

-- CreateIndex
CREATE INDEX "schedule_item_nextTicketWorkflowStateId_idx" ON "schedule_item"("nextTicketWorkflowStateId");

-- CreateIndex
CREATE INDEX "schedule_item_roleId_idx" ON "schedule_item"("roleId");

-- CreateIndex
CREATE INDEX "schedule_item_organizationId_idx" ON "schedule_item"("organizationId");

-- CreateIndex
CREATE INDEX "schedule_item_ticketId_idx" ON "schedule_item"("ticketId");

-- CreateIndex
CREATE INDEX "skill_organizationId_idx" ON "skill"("organizationId");

-- CreateIndex
CREATE INDEX "skill_featureId_idx" ON "skill"("featureId");

-- CreateIndex
CREATE INDEX "skill_roleId_idx" ON "skill"("roleId");

-- CreateIndex
CREATE INDEX "skill_rating_skillId_idx" ON "skill_rating"("skillId");

-- CreateIndex
CREATE INDEX "tag_organizationId_idx" ON "tag"("organizationId");

-- CreateIndex
CREATE INDEX "tag_replacedByTagId_idx" ON "tag"("replacedByTagId");

-- CreateIndex
CREATE INDEX "tag_authorId_idx" ON "tag"("authorId");

-- CreateIndex
CREATE INDEX "team_organizationId_idx" ON "team"("organizationId");

-- CreateIndex
CREATE INDEX "ticket_authorId_idx" ON "ticket"("authorId");

-- CreateIndex
CREATE INDEX "ticket_ownerId_idx" ON "ticket"("ownerId");

-- CreateIndex
CREATE INDEX "ticket_productId_idx" ON "ticket"("productId");

-- CreateIndex
CREATE INDEX "ticket_workflowId_idx" ON "ticket"("workflowId");

-- CreateIndex
CREATE INDEX "ticket_folderId_idx" ON "ticket"("folderId");

-- CreateIndex
CREATE INDEX "ticket_organizationId_idx" ON "ticket"("organizationId");

-- CreateIndex
CREATE INDEX "ticket_workflow_state_assigneeId_idx" ON "ticket_workflow_state"("assigneeId");

-- CreateIndex
CREATE INDEX "ticket_workflow_state_ticketId_idx" ON "ticket_workflow_state"("ticketId");

-- CreateIndex
CREATE INDEX "ticket_workflow_state_workflowStateId_idx" ON "ticket_workflow_state"("workflowStateId");

-- CreateIndex
CREATE INDEX "ticket_workflow_state_note_ticketWorkflowStateId_idx" ON "ticket_workflow_state_note"("ticketWorkflowStateId");

-- CreateIndex
CREATE INDEX "ticket_workflow_state_note_fromTicketWorkflowStateId_idx" ON "ticket_workflow_state_note"("fromTicketWorkflowStateId");

-- CreateIndex
CREATE INDEX "ticket_workflow_state_note_authorId_idx" ON "ticket_workflow_state_note"("authorId");

-- CreateIndex
CREATE INDEX "time_off_organizationId_idx" ON "time_off"("organizationId");

-- CreateIndex
CREATE INDEX "time_off_roleId_idx" ON "time_off"("roleId");

-- CreateIndex
CREATE INDEX "todo_organizationId_idx" ON "todo"("organizationId");

-- CreateIndex
CREATE INDEX "todo_ownerId_idx" ON "todo"("ownerId");

-- CreateIndex
CREATE INDEX "workflow_organizationId_idx" ON "workflow"("organizationId");

-- CreateIndex
CREATE INDEX "workflow_state_organizationId_idx" ON "workflow_state"("organizationId");

-- CreateIndex
CREATE INDEX "workflow_state_workflowId_idx" ON "workflow_state"("workflowId");

-- AddForeignKey
ALTER TABLE "push_subscription" ADD CONSTRAINT "push_subscription_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_start_reminder" ADD CONSTRAINT "role_start_reminder_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

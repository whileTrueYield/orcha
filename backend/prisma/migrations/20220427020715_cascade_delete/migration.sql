-- DropForeignKey
ALTER TABLE "Estimate" DROP CONSTRAINT "Estimate_assigneeId_fkey";

-- DropForeignKey
ALTER TABLE "comment" DROP CONSTRAINT "comment_authorId_fkey";

-- DropForeignKey
ALTER TABLE "comment" DROP CONSTRAINT "comment_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "comment" DROP CONSTRAINT "comment_ticketId_fkey";

-- DropForeignKey
ALTER TABLE "feature" DROP CONSTRAINT "feature_featureGroupId_fkey";

-- DropForeignKey
ALTER TABLE "feature_group" DROP CONSTRAINT "feature_group_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "feature_group" DROP CONSTRAINT "feature_group_productId_fkey";

-- DropForeignKey
ALTER TABLE "folder" DROP CONSTRAINT "folder_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "job" DROP CONSTRAINT "job_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "note" DROP CONSTRAINT "note_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "note" DROP CONSTRAINT "note_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "notification" DROP CONSTRAINT "notification_actorId_fkey";

-- DropForeignKey
ALTER TABLE "notification" DROP CONSTRAINT "notification_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "notification" DROP CONSTRAINT "notification_roleId_fkey";

-- DropForeignKey
ALTER TABLE "organization" DROP CONSTRAINT "organization_billingAddressId_fkey";

-- DropForeignKey
ALTER TABLE "organization" DROP CONSTRAINT "organization_mailingAddressId_fkey";

-- DropForeignKey
ALTER TABLE "organization_address" DROP CONSTRAINT "organization_address_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "organization_upload" DROP CONSTRAINT "organization_upload_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "organization_upload" DROP CONSTRAINT "organization_upload_roleId_fkey";

-- DropForeignKey
ALTER TABLE "page" DROP CONSTRAINT "page_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "personal_tag" DROP CONSTRAINT "personal_tag_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "personal_tag" DROP CONSTRAINT "personal_tag_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "personal_tag" DROP CONSTRAINT "personal_tag_replacedByTagId_fkey";

-- DropForeignKey
ALTER TABLE "product" DROP CONSTRAINT "product_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "project" DROP CONSTRAINT "project_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "project" DROP CONSTRAINT "project_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "question" DROP CONSTRAINT "question_authorId_fkey";

-- DropForeignKey
ALTER TABLE "question" DROP CONSTRAINT "question_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "question" DROP CONSTRAINT "question_ticketId_fkey";

-- DropForeignKey
ALTER TABLE "question_reply" DROP CONSTRAINT "question_reply_authorId_fkey";

-- DropForeignKey
ALTER TABLE "question_reply" DROP CONSTRAINT "question_reply_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "question_reply" DROP CONSTRAINT "question_reply_questionId_fkey";

-- DropForeignKey
ALTER TABLE "role" DROP CONSTRAINT "role_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "role" DROP CONSTRAINT "role_userId_fkey";

-- DropForeignKey
ALTER TABLE "schedule_item" DROP CONSTRAINT "schedule_item_nextTicketWorkflowStateId_fkey";

-- DropForeignKey
ALTER TABLE "schedule_item" DROP CONSTRAINT "schedule_item_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "schedule_item" DROP CONSTRAINT "schedule_item_roleId_fkey";

-- DropForeignKey
ALTER TABLE "schedule_item" DROP CONSTRAINT "schedule_item_ticketId_fkey";

-- DropForeignKey
ALTER TABLE "schedule_item" DROP CONSTRAINT "schedule_item_ticketWorkflowStateId_fkey";

-- DropForeignKey
ALTER TABLE "schedule_priority" DROP CONSTRAINT "schedule_priority_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "skill" DROP CONSTRAINT "skill_featureId_fkey";

-- DropForeignKey
ALTER TABLE "skill" DROP CONSTRAINT "skill_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "skill" DROP CONSTRAINT "skill_roleId_fkey";

-- DropForeignKey
ALTER TABLE "skill_rating" DROP CONSTRAINT "skill_rating_skillId_fkey";

-- DropForeignKey
ALTER TABLE "tag" DROP CONSTRAINT "tag_authorId_fkey";

-- DropForeignKey
ALTER TABLE "tag" DROP CONSTRAINT "tag_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "tag" DROP CONSTRAINT "tag_replacedByTagId_fkey";

-- DropForeignKey
ALTER TABLE "team" DROP CONSTRAINT "team_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "ticket" DROP CONSTRAINT "ticket_authorId_fkey";

-- DropForeignKey
ALTER TABLE "ticket" DROP CONSTRAINT "ticket_folderId_fkey";

-- DropForeignKey
ALTER TABLE "ticket" DROP CONSTRAINT "ticket_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "ticket" DROP CONSTRAINT "ticket_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "ticket" DROP CONSTRAINT "ticket_productId_fkey";

-- DropForeignKey
ALTER TABLE "ticket" DROP CONSTRAINT "ticket_workflowId_fkey";

-- DropForeignKey
ALTER TABLE "ticket_workflow_state" DROP CONSTRAINT "ticket_workflow_state_assigneeId_fkey";

-- DropForeignKey
ALTER TABLE "ticket_workflow_state" DROP CONSTRAINT "ticket_workflow_state_ticketId_fkey";

-- DropForeignKey
ALTER TABLE "ticket_workflow_state" DROP CONSTRAINT "ticket_workflow_state_workflowStateId_fkey";

-- DropForeignKey
ALTER TABLE "ticket_workflow_state_note" DROP CONSTRAINT "ticket_workflow_state_note_authorId_fkey";

-- DropForeignKey
ALTER TABLE "ticket_workflow_state_note" DROP CONSTRAINT "ticket_workflow_state_note_fromTicketWorkflowStateId_fkey";

-- DropForeignKey
ALTER TABLE "ticket_workflow_state_note" DROP CONSTRAINT "ticket_workflow_state_note_ticketWorkflowStateId_fkey";

-- DropForeignKey
ALTER TABLE "time_off" DROP CONSTRAINT "time_off_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "time_off" DROP CONSTRAINT "time_off_roleId_fkey";

-- DropForeignKey
ALTER TABLE "todo" DROP CONSTRAINT "todo_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "todo" DROP CONSTRAINT "todo_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "workflow" DROP CONSTRAINT "workflow_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "workflow_state" DROP CONSTRAINT "workflow_state_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "workflow_state" DROP CONSTRAINT "workflow_state_workflowId_fkey";

-- AlterTable
ALTER TABLE "organization_upload" ALTER COLUMN "roleId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "project" ALTER COLUMN "ownerId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "tag" ALTER COLUMN "authorId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ticket" ALTER COLUMN "authorId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "job" ADD CONSTRAINT "job_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "todo" ADD CONSTRAINT "todo_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "todo" ADD CONSTRAINT "todo_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note" ADD CONSTRAINT "note_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note" ADD CONSTRAINT "note_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feature" ADD CONSTRAINT "feature_featureGroupId_fkey" FOREIGN KEY ("featureGroupId") REFERENCES "feature_group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feature_group" ADD CONSTRAINT "feature_group_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feature_group" ADD CONSTRAINT "feature_group_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_address" ADD CONSTRAINT "organization_address_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_mailingAddressId_fkey" FOREIGN KEY ("mailingAddressId") REFERENCES "organization_address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_billingAddressId_fkey" FOREIGN KEY ("billingAddressId") REFERENCES "organization_address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_upload" ADD CONSTRAINT "organization_upload_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_upload" ADD CONSTRAINT "organization_upload_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personal_tag" ADD CONSTRAINT "personal_tag_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personal_tag" ADD CONSTRAINT "personal_tag_replacedByTagId_fkey" FOREIGN KEY ("replacedByTagId") REFERENCES "personal_tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personal_tag" ADD CONSTRAINT "personal_tag_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estimate" ADD CONSTRAINT "Estimate_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page" ADD CONSTRAINT "page_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folder" ADD CONSTRAINT "folder_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "question_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "question_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "question_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_reply" ADD CONSTRAINT "question_reply_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_reply" ADD CONSTRAINT "question_reply_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_reply" ADD CONSTRAINT "question_reply_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role" ADD CONSTRAINT "role_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role" ADD CONSTRAINT "role_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_item" ADD CONSTRAINT "schedule_item_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_item" ADD CONSTRAINT "schedule_item_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_item" ADD CONSTRAINT "schedule_item_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_item" ADD CONSTRAINT "schedule_item_ticketWorkflowStateId_fkey" FOREIGN KEY ("ticketWorkflowStateId") REFERENCES "ticket_workflow_state"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_item" ADD CONSTRAINT "schedule_item_nextTicketWorkflowStateId_fkey" FOREIGN KEY ("nextTicketWorkflowStateId") REFERENCES "ticket_workflow_state"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_off" ADD CONSTRAINT "time_off_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_off" ADD CONSTRAINT "time_off_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill" ADD CONSTRAINT "skill_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "feature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill" ADD CONSTRAINT "skill_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill" ADD CONSTRAINT "skill_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_rating" ADD CONSTRAINT "skill_rating_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag" ADD CONSTRAINT "tag_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag" ADD CONSTRAINT "tag_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag" ADD CONSTRAINT "tag_replacedByTagId_fkey" FOREIGN KEY ("replacedByTagId") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team" ADD CONSTRAINT "team_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_priority" ADD CONSTRAINT "schedule_priority_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_workflow_state_note" ADD CONSTRAINT "ticket_workflow_state_note_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_workflow_state_note" ADD CONSTRAINT "ticket_workflow_state_note_ticketWorkflowStateId_fkey" FOREIGN KEY ("ticketWorkflowStateId") REFERENCES "ticket_workflow_state"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_workflow_state_note" ADD CONSTRAINT "ticket_workflow_state_note_fromTicketWorkflowStateId_fkey" FOREIGN KEY ("fromTicketWorkflowStateId") REFERENCES "ticket_workflow_state"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_workflow_state" ADD CONSTRAINT "ticket_workflow_state_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_workflow_state" ADD CONSTRAINT "ticket_workflow_state_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_workflow_state" ADD CONSTRAINT "ticket_workflow_state_workflowStateId_fkey" FOREIGN KEY ("workflowStateId") REFERENCES "workflow_state"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow" ADD CONSTRAINT "workflow_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_state" ADD CONSTRAINT "workflow_state_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_state" ADD CONSTRAINT "workflow_state_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE "ticket_workflow_state" DROP CONSTRAINT "ticket_workflow_state_assigneeId_fkey";

-- DropForeignKey
ALTER TABLE "ticket_workflow_state" DROP CONSTRAINT "ticket_workflow_state_workflowStateId_fkey";

-- DropForeignKey
ALTER TABLE "ticket_workflow_state_note" DROP CONSTRAINT "ticket_workflow_state_note_authorId_fkey";

-- DropForeignKey
ALTER TABLE "ticket_workflow_state_note" DROP CONSTRAINT "ticket_workflow_state_note_ticketWorkflowStateId_fkey";

-- AddForeignKey
ALTER TABLE "ticket_workflow_state_note" ADD CONSTRAINT "ticket_workflow_state_note_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ticket_workflow_state_note" ADD CONSTRAINT "ticket_workflow_state_note_ticketWorkflowStateId_fkey" FOREIGN KEY ("ticketWorkflowStateId") REFERENCES "ticket_workflow_state"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ticket_workflow_state" ADD CONSTRAINT "ticket_workflow_state_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "role"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ticket_workflow_state" ADD CONSTRAINT "ticket_workflow_state_workflowStateId_fkey" FOREIGN KEY ("workflowStateId") REFERENCES "workflow_state"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

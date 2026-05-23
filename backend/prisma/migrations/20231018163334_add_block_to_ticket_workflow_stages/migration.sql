-- CreateEnum
CREATE TYPE "TicketWorkflowStateNoteCategory" AS ENUM ('STATE_NOTE', 'BLOCK_NOTE', 'UNBLOCK_NOTE', 'CLOSE_NOTE');

-- AlterTable
ALTER TABLE "ticket_workflow_state" ADD COLUMN     "isBlocked" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ticket_workflow_state_note" ADD COLUMN     "category" "TicketWorkflowStateNoteCategory" NOT NULL DEFAULT 'STATE_NOTE';

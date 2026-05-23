-- CreateTable
CREATE TABLE "ticket_workflow_state_note" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "ticketWorkflowStateId" INTEGER NOT NULL,
    "authorId" INTEGER NOT NULL,
    "fromTicketWorkflowStateId" INTEGER NOT NULL,

    CONSTRAINT "ticket_workflow_state_note_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ticket_workflow_state_note_createdAt_idx" ON "ticket_workflow_state_note"("createdAt");

-- AddForeignKey
ALTER TABLE "ticket_workflow_state_note" ADD CONSTRAINT "ticket_workflow_state_note_ticketWorkflowStateId_fkey" FOREIGN KEY ("ticketWorkflowStateId") REFERENCES "ticket_workflow_state"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ticket_workflow_state_note" ADD CONSTRAINT "ticket_workflow_state_note_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ticket_workflow_state_note" ADD CONSTRAINT "ticket_workflow_state_note_fromTicketWorkflowStateId_fkey" FOREIGN KEY ("fromTicketWorkflowStateId") REFERENCES "ticket_workflow_state"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

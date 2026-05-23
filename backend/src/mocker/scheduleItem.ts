import { Role, Ticket, TicketWorkflowState } from "../models/entities";
import prisma from "../prisma";

export const createScheduleItem = (
  startedAt: Date,
  stoppedAt: Date,
  ticket: Ticket,
  role: Role,
  ticketWorkflowState: TicketWorkflowState
) => {
  return prisma.scheduleItem.create({
    data: {
      startedAt,
      stoppedAt,
      ticket: { connect: { id: ticket.id } },
      organization: { connect: { id: ticket.organizationId } },
      ticketWorkflowState: { connect: { id: ticketWorkflowState.id } },
      role: { connect: { id: role.id } },
    },
  });
};

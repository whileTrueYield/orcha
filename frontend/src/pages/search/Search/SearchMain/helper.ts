import { ModelStage, Ticket, TicketStatus } from "types/graphql";

export const getTicketStage = (ticket: Ticket): string => {
  if (ticket.stage === ModelStage.Draft) {
    return "Draft";
  } else if (ticket.stage === ModelStage.Published) {
    if (ticket.status === TicketStatus.Unscheduled) {
      return "Unscheduled";
    } else if (ticket.status === TicketStatus.Scheduled) {
      return "Scheduled";
    } else if (ticket.status === TicketStatus.Done) {
      return "Done";
    } else if (ticket.status === TicketStatus.Cancelled) {
      return "Cancelled";
    }
  } else if (ticket.stage === ModelStage.Archived) {
    return "Archived";
  }

  return "Unknown";
};

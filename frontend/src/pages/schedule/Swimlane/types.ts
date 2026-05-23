import { ScheduleItem, Ticket, TicketWorkflowState } from "types/graphql";

export interface SwimlaneTask {
  ticket: Ticket;
  state: TicketWorkflowState;
  scheduleItem?: ScheduleItem | null;
}

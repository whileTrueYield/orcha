import { TicketStatus } from "types/graphql";

export interface SwimlaneScheduleItem {
  duration: number;
  ticketId: number;
  ticketTitle: string;
  ticketLocalId?: number | null;
  ticketProductCode?: string;
  ticketWorkflowStateName: string;
  ticketWorkflowStateId: number;
  ticketStatus: TicketStatus;
  stoppedAt?: string | null;
}

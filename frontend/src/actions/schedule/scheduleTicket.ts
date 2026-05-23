import { ActionWithPayload } from "../actionTypes";
import { Ticket } from "types/graphql";

export type AddTicketToScheduleAction = ActionWithPayload<
  "ADD_TICKET_TO_SCHEDULE",
  Ticket
>;

export type RemoveTicketFromScheduleAction = ActionWithPayload<
  "REMOVE_TICKET_FROM_SCHEDULE",
  Ticket
>;

export const addTicketToSchedule = (
  payload: Ticket
): AddTicketToScheduleAction => ({
  type: "ADD_TICKET_TO_SCHEDULE",
  payload,
});

export const removeTicketFromSchedule = (
  payload: Ticket
): RemoveTicketFromScheduleAction => ({
  type: "REMOVE_TICKET_FROM_SCHEDULE",
  payload,
});

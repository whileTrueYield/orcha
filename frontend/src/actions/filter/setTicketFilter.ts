import { ActionWithPayload, EmptyAction } from "../actionTypes";
import { TicketListFilter } from "../../types";

export type SetTicketFilterAction = ActionWithPayload<
  "SET_TICKET_FILTER",
  TicketListFilter
>;

export type ClearTicketFilterAction = EmptyAction<"CLEAR_TICKET_FILTER">;

export const setTicketFilter = (
  payload: TicketListFilter
): SetTicketFilterAction => ({
  type: "SET_TICKET_FILTER",
  payload,
});

export const clearTicketFilter = (): ClearTicketFilterAction => ({
  type: "CLEAR_TICKET_FILTER",
});

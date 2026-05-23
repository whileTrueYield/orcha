import { ActionWithPayload, EmptyAction } from "actions/actionTypes";

export type EditorShowTicketAction = ActionWithPayload<
  "SHOW_TICKET_EDIT_MODAL",
  { ticketId: number }
>;

export type EditorHideTicketAction = EmptyAction<"HIDE_TICKET_EDIT_MODAL">;

export const showTicketEditModal = (
  ticketId: number
): EditorShowTicketAction => ({
  type: "SHOW_TICKET_EDIT_MODAL",
  payload: { ticketId },
});

export const hideTicketEditModal = (): EditorHideTicketAction => ({
  type: "HIDE_TICKET_EDIT_MODAL",
});

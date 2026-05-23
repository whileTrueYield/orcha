import { ACTION_TYPES } from "actions/types";

export type State = number | null;

const initialState: State = null;

export const reducer = (
  state: State = initialState,
  action: ACTION_TYPES
): State => {
  switch (action.type) {
    case "SHOW_TICKET_EDIT_MODAL":
      return action.payload.ticketId;
    case "HIDE_TICKET_EDIT_MODAL":
      return null;
    default:
      return state;
  }
};

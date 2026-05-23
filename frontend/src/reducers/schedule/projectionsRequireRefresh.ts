import { ACTION_TYPES } from "actions/types";

export type State = boolean;

const initialState: State = false;

export const reducer = (
  state: State = initialState,
  action: ACTION_TYPES
): State => {
  switch (action.type) {
    case "SET_SCHEDULE_PROJECTIONS":
      return false;

    case "RESET_SCHEDULE_PRIORITIES":
    case "RESET_SCHEDULE_TICKETS":
    case "RESET_SCHEDULE":
    case "ADD_TICKET_TO_SCHEDULE":
    case "REMOVE_TICKET_FROM_SCHEDULE":
    case "SET_SCHEDULE_PRIORITIES":
      return true;

    default:
      return state;
  }
};

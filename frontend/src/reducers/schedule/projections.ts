import { ACTION_TYPES } from "actions/types";
import { ScheduleTicketRow } from "types";

export type State = ScheduleTicketRow[] | null;

const initialState: State = null;

export const reducer = (
  state: State = initialState,
  action: ACTION_TYPES
): State => {
  switch (action.type) {
    case "SET_SCHEDULE_PROJECTIONS":
      return action.payload;

    case "RESET_SCHEDULE":
      return null;

    default:
      return state;
  }
};

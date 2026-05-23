import { ACTION_TYPES } from "actions/types";
import { ScheduleTicketColumns, ScheduleTicketSortDirection } from "types";

export type State = {
  sort: ScheduleTicketColumns;
  direction: ScheduleTicketSortDirection;
};

const initialState: State = { sort: "status", direction: "asc" };

export const reducer = (
  state: State = initialState,
  action: ACTION_TYPES
): State => {
  switch (action.type) {
    case "SET_SCHEDULE_PROJECTIONS_SORTING":
      return action.payload;

    case "RESET_SCHEDULE":
      return initialState;

    default:
      return state;
  }
};

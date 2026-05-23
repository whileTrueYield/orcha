import { ACTION_TYPES } from "actions/types";
import { ScheduleConfigs } from "types";

export type State = ScheduleConfigs[] | null;

const initialState: State = null;

export const reducer = (
  state: State = initialState,
  action: ACTION_TYPES
): State => {
  switch (action.type) {
    case "SET_SCHEDULE_PRIORITIES":
      return action.payload;

    case "RESET_SCHEDULE_PRIORITIES":
    case "RESET_SCHEDULE":
      return null;

    default:
      return state;
  }
};

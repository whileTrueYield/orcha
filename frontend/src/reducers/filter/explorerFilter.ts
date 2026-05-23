import { ACTION_TYPES } from "actions/types";
import { merge } from "lodash";
import { ExplorerFilter } from "types/filter";

export type State = ExplorerFilter;

const initialState: State = {
  recordSets: {},
  flags: {
    hideCompleted: {
      label: "Hide Completed",
      value: false,
    },
  },
  valueSets: {},
  dates: {},
  sort: {
    direction: "ASC",
    field: "title",
  },
};

export const reducer = (
  state: State = initialState,
  action: ACTION_TYPES
): State => {
  switch (action.type) {
    case "SET_EXPLORER_FILTER":
      return action.payload;

    case "UPDATE_EXPLORER_FILTER":
      return merge({}, state, action.payload);

    case "CLEAR_EXPLORER_FILTER":
      return initialState;

    default:
      return state;
  }
};

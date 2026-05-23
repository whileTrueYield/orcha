import { ACTION_TYPES } from "actions/types";

export type State = boolean;

const initialState: State = false;

export const reducer = (
  state: State = initialState,
  action: ACTION_TYPES
): State => {
  switch (action.type) {
    case "SHOW_ARCHIVED_PROJECT":
      return action.payload;
    default:
      return state;
  }
};

import { ACTION_TYPES } from "actions/types";
import { uniq, without } from "lodash";

export type State = string[];

const initialState: State = [];

export const reducer = (
  state: State = initialState,
  action: ACTION_TYPES
): State => {
  switch (action.type) {
    case "SHOW_TIPS":
      return uniq([...state, action.payload]);
    case "HIDE_TIPS":
      return without(state, action.payload);
    case "HIDE_ALL_TIPS":
      return initialState;
    default:
      return state;
  }
};

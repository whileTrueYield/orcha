import { ACTION_TYPES } from "actions/types";
import { uniq } from "lodash";

export type State = number[];

const initialState: State = [];

export const reducer = (
  state: State = initialState,
  action: ACTION_TYPES
): State => {
  switch (action.type) {
    case "SET_OPENED_PROJECTS":
      return uniq(action.payload);
    default:
      return state;
  }
};

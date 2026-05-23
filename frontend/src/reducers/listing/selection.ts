import { ACTION_TYPES } from "actions/types";
import { difference, omit, uniq } from "lodash";

export type State = { [domain: string]: string[] };

const initialState: State = {};

export const reducer = (
  state: State = initialState,
  action: ACTION_TYPES
): State => {
  let selection: string[] = [];

  switch (action.type) {
    case "ADD_TO_SELECTION":
      selection = state[action.payload.domain] || [];
      return {
        ...state,
        [action.payload.domain]: uniq([
          ...selection,
          ...action.payload.itemIds,
        ]),
      };

    case "REMOVE_FROM_SELECTION":
      selection = state[action.payload.domain] || [];
      return {
        ...state,
        [action.payload.domain]: difference(selection, action.payload.itemIds),
      };

    case "SET_SELECTION":
      return {
        ...state,
        [action.payload.domain]: uniq(action.payload.itemIds),
      };

    case "CLEAR_SELECTION":
      return omit(state, action.payload);

    default:
      return state;
  }
};

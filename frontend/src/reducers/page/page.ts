import { ACTION_TYPES } from "actions/types";

export type State = string;

const initialState: State = "";

export const reducer = (
  state: State = initialState,
  action: ACTION_TYPES
): State => {
  switch (action.type) {
    case "SET_PAGE":
      document.title = action.payload + " - Orcha";
      return action.payload;
    default:
      return state;
  }
};

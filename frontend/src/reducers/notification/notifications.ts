import { ACTION_TYPES } from "actions/types";
import { reject } from "lodash";
import { Notification } from "types";
import { createNotification } from "./createNotification";

export type State = Notification[];

const initialState: State = [];

export const reducer = (
  state: State = initialState,
  action: ACTION_TYPES
): State => {
  switch (action.type) {
    case "DISMISS_NOTIFICATION":
      return reject(state, { index: action.payload }) as State;

    case "CREATE_NOTIFICATION":
      return [...state, createNotification(action.payload)];

    default:
      return state;
  }
};

import { ACTION_TYPES } from "actions/types";
import { takeRight } from "lodash";
import { Notification } from "types";
import { createNotification } from "./createNotification";

export type State = Notification[];

const initialState: State = [];

export const reducer = (
  state: State = initialState,
  action: ACTION_TYPES
): State => {
  switch (action.type) {
    case "CREATE_NOTIFICATION":
      const { type, title, subTitle, index, duration } = action.payload;
      return [
        ...takeRight(state, 9), // keep the last 9 notifications
        createNotification({ index, type, title, subTitle, duration }),
      ];

    default:
      return state;
  }
};

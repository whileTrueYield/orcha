import { ACTION_TYPES } from "actions/types";
import { reject, uniqBy } from "lodash";
import { Ticket } from "types/graphql";

export type State = Ticket[];

const initialState: State = [];

export const reducer = (
  state: State = initialState,
  action: ACTION_TYPES
): State => {
  switch (action.type) {
    case "ADD_TICKET_TO_SCHEDULE":
      return reject(state, { id: action.payload.id });

    case "REMOVE_TICKET_FROM_SCHEDULE":
      return uniqBy([...state, action.payload], "id");

    case "RESET_SCHEDULE_TICKETS":
    case "RESET_SCHEDULE":
      return [];

    default:
      return state;
  }
};

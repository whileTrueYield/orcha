import { ACTION_TYPES } from "actions/types";
import { merge } from "lodash";
import { Me } from "types/graphql";

export type State = Me | null;

const initialState: State = null;

export const reducer = (
  state: State = initialState,
  action: ACTION_TYPES
): State => {
  switch (action.type) {
    case "LOGIN_SUCCESS":
    case "SET_ME":
      return action.payload;
    case "SET_ME_USER":
      return { ...state, user: merge(state?.user, action.payload) } as State;
    case "SET_ME_ORGANIZATION":
      return {
        ...state,
        organization: merge(state?.organization, action.payload),
      } as State;
    case "SET_ME_ROLE":
      return { ...state, role: merge(state?.role, action.payload) } as State;
    default:
      return state;
  }
};

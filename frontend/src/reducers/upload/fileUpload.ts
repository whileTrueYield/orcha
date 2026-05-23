import { ACTION_TYPES } from "actions/types";
import { omit } from "lodash";

export type State = {
  [name: string]: string;
};

const initialState: State = {};

export const reducer = (
  state: State = initialState,
  action: ACTION_TYPES
): State => {
  switch (action.type) {
    case "UPLOAD_FILE_SUCCESS":
      const { name, url } = action.payload;
      return {
        ...state,
        [name]: url,
      };

    case "UPLOAD_FILE_CANCEL":
      return omit(state, action.payload.name);

    default:
      return state;
  }
};

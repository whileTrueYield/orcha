import { ACTION_TYPES } from "actions/types";

export type State = boolean;

const initialState: State = false;

export const reducer = (
  state: State = initialState,
  action: ACTION_TYPES
): State => {
  switch (action.type) {
    case "UPLOAD_FILE":
      return true;
    case "UPLOAD_FILE_CANCEL":
    case "UPLOAD_FILE_FAILURE":
    case "UPLOAD_FILE_SUCCESS":
      return false;

    default:
      return state;
  }
};

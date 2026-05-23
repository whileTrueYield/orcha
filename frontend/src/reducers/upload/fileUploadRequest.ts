import { ACTION_TYPES } from "actions/types";
import { FILE_UPLOAD_CATEGORY } from "actions/upload/uploadFile";
import { omit } from "lodash";

export type State = {
  [name: string]: {
    file: File;
    name: string;
    category: FILE_UPLOAD_CATEGORY;
    issueToken?: string;
  };
};

const initialState: State = {};

export const reducer = (
  state: State = initialState,
  action: ACTION_TYPES
): State => {
  switch (action.type) {
    case "UPLOAD_FILE":
      const { name, file, category, issueToken } = action.payload;
      return {
        ...state,
        [name]: { file, name, category, issueToken },
      };
    case "UPLOAD_FILE_FAILURE":
    case "UPLOAD_FILE_SUCCESS":
    case "UPLOAD_FILE_CANCEL":
      return omit(state, action.payload.name);

    default:
      return state;
  }
};

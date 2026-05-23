import { ActionWithPayload, EmptyAction } from "actions/actionTypes";

export type FILE_UPLOAD_CATEGORY = "organization" | "user";

export type UploadFileAction = ActionWithPayload<
  "UPLOAD_FILE",
  {
    file: File;
    name: string;
    category: FILE_UPLOAD_CATEGORY;
    issueToken?: string;
  }
>;

export type UploadFileReqSuccessAction = ActionWithPayload<
  "UPLOAD_FILE_REQ_SUCCESS",
  { file: File; name: string; url: string; fields: { [key: string]: string } }
>;

export type UploadFileSuccessAction = ActionWithPayload<
  "UPLOAD_FILE_SUCCESS",
  { url: string; name: string }
>;
export type UploadFileErrorAction = EmptyAction<"UPLOAD_FILE_ERROR">;
export type UploadFileCancelAction = ActionWithPayload<
  "UPLOAD_FILE_CANCEL",
  { name: string }
>;

export type UploadFileFailureAction = ActionWithPayload<
  "UPLOAD_FILE_FAILURE",
  { name: string }
>;

export const uploadFileCancel = (name: string): UploadFileCancelAction => ({
  type: "UPLOAD_FILE_CANCEL",
  payload: { name },
});

export const uploadFileSuccess = (
  url: string,
  name: string
): UploadFileSuccessAction => ({
  type: "UPLOAD_FILE_SUCCESS",
  payload: { url, name },
});

export const uploadFile = (
  file: File,
  name: string,
  category: FILE_UPLOAD_CATEGORY,
  issueToken?: string
): UploadFileAction | UploadFileErrorAction => {
  if (!file) {
    return {
      type: "UPLOAD_FILE_ERROR",
      error: "A file is required to process an upload",
    };
  }

  if (!name) {
    return {
      type: "UPLOAD_FILE_ERROR",
      error: "A name is required to process an upload",
    };
  }

  return {
    type: "UPLOAD_FILE",
    payload: { file, name, category, issueToken },
  };
};

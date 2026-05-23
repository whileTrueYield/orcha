import {
  UploadFileAction,
  UploadFileSuccessAction,
  UploadFileCancelAction,
  UploadFileFailureAction,
} from "./uploadFile";

export type UPLOAD_ACTION_TYPES =
  | UploadFileAction
  | UploadFileCancelAction
  | UploadFileFailureAction
  | UploadFileSuccessAction;

import { combineReducers } from "redux";
import * as fileUpload from "./fileUpload";
import * as isUploading from "./isUploading";
import * as fileUploadRequest from "./fileUploadRequest";

export default combineReducers({
  fileUpload: fileUpload.reducer,
  isUploading: isUploading.reducer,
  fileUploadRequest: fileUploadRequest.reducer,
});

export interface State {
  fileUpload: fileUpload.State;
  isUploading: isUploading.State;
  fileUploadRequest: fileUploadRequest.State;
}

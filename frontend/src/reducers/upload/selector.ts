import { State } from "./index";

export const getUpload = (state: State, name: string) => state.fileUpload[name];
export const getUploads = (state: State) => state.fileUpload;
export const isUploading = (state: State) => state.isUploading;
export const getUploadRequest = (state: State, name: string) =>
  state.fileUploadRequest[name];
export const getUploadRequests = (state: State) => state.fileUploadRequest;

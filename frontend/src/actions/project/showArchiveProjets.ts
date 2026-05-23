import { ActionWithPayload } from "../actionTypes";

export type ShowArchiveProjets = ActionWithPayload<
  "SHOW_ARCHIVED_PROJECT",
  boolean
>;

export const setShowArchiveProjets = (show: boolean): ShowArchiveProjets => ({
  type: "SHOW_ARCHIVED_PROJECT",
  payload: show,
});

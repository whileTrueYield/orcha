import {
  AddToSelectionAction,
  ClearSelectionAction,
  RemoveFromSelectionAction,
  SetSelectionAction,
} from "./selection";

export type LISTING_ACTION_TYPES =
  | AddToSelectionAction
  | ClearSelectionAction
  | RemoveFromSelectionAction
  | SetSelectionAction;

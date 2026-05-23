import { ActionWithPayload } from "actions/actionTypes";

interface SelectionParams {
  domain: string;
  itemIds: string[];
}

export type AddToSelectionAction = ActionWithPayload<
  "ADD_TO_SELECTION",
  SelectionParams
>;

export type SetSelectionAction = ActionWithPayload<
  "SET_SELECTION",
  SelectionParams
>;

export type RemoveFromSelectionAction = ActionWithPayload<
  "REMOVE_FROM_SELECTION",
  SelectionParams
>;

export type ClearSelectionAction = ActionWithPayload<"CLEAR_SELECTION", string>;

export const addToSelection = (
  payload: SelectionParams
): AddToSelectionAction => ({
  type: "ADD_TO_SELECTION",
  payload,
});

export const removeFromSelection = (
  payload: SelectionParams
): RemoveFromSelectionAction => ({
  type: "REMOVE_FROM_SELECTION",
  payload,
});

export const setSelection = (payload: SelectionParams): SetSelectionAction => ({
  type: "SET_SELECTION",
  payload,
});

export const clearSelection = (payload: string): ClearSelectionAction => ({
  type: "CLEAR_SELECTION",
  payload,
});

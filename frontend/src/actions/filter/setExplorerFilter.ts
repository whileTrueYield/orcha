import { ActionWithPayload, EmptyAction } from "../actionTypes";
import { DeepPartial, ExplorerFilter } from "../../types";

export type SetExplorerFilterAction = ActionWithPayload<
  "SET_EXPLORER_FILTER",
  ExplorerFilter
>;

export type UpdateExplorerFilterAction = ActionWithPayload<
  "UPDATE_EXPLORER_FILTER",
  DeepPartial<ExplorerFilter>
>;

export type ClearExplorerFilterAction = EmptyAction<"CLEAR_EXPLORER_FILTER">;

export const updateExplorerFilter = (
  payload: DeepPartial<ExplorerFilter> = {},
): UpdateExplorerFilterAction => ({
  type: "UPDATE_EXPLORER_FILTER",
  payload,
});

export const setExplorerFilter = (
  payload: ExplorerFilter,
): SetExplorerFilterAction => ({
  type: "SET_EXPLORER_FILTER",
  payload,
});

export const clearExplorerFilter = (): ClearExplorerFilterAction => ({
  type: "CLEAR_EXPLORER_FILTER",
});

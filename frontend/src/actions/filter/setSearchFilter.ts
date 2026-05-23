import { ActionWithPayload, EmptyAction } from "../actionTypes";
import { DeepPartial, SearchFilter } from "../../types";

export type SetSearchFilterAction = ActionWithPayload<
  "SET_SEARCH_FILTER",
  DeepPartial<SearchFilter>
>;

export type UpdateSearchFilterAction = ActionWithPayload<
  "UPDATE_SEARCH_FILTER",
  DeepPartial<SearchFilter>
>;

export type ToggleAllUntagged = EmptyAction<"TOGGLE_ALL_UNTAGGED">;

export type ClearSearchFilterAction = EmptyAction<"CLEAR_SEARCH_FILTER">;

export const setSearchFilter = (
  payload: DeepPartial<SearchFilter> = {},
): SetSearchFilterAction => ({
  type: "SET_SEARCH_FILTER",
  payload,
});

export const updateSearchFilter = (
  payload: DeepPartial<SearchFilter> = {},
): UpdateSearchFilterAction => ({
  type: "UPDATE_SEARCH_FILTER",
  payload,
});

export const clearSearchFilter = (): ClearSearchFilterAction => ({
  type: "CLEAR_SEARCH_FILTER",
});

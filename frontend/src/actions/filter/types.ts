import {
  SetTicketFilterAction,
  ClearTicketFilterAction,
} from "./setTicketFilter";

import {
  SetExplorerFilterAction,
  ClearExplorerFilterAction,
  UpdateExplorerFilterAction,
} from "./setExplorerFilter";

import {
  SetSearchFilterAction,
  ClearSearchFilterAction,
  UpdateSearchFilterAction,
  ToggleAllUntagged,
} from "./setSearchFilter";

export type FILTER_ACTION_TYPES =
  | SetTicketFilterAction
  | ClearTicketFilterAction
  | SetSearchFilterAction
  | SetExplorerFilterAction
  | UpdateExplorerFilterAction
  | ClearSearchFilterAction
  | ClearExplorerFilterAction
  | UpdateSearchFilterAction
  | ToggleAllUntagged;

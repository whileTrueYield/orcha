import { isEqual } from "lodash";
import { State } from "./index";
import * as searchReducer from "./searchFilter";

export const getTicketFilter = (state: State) => state.ticketFilter;
export const getSearchFilter = (state: State) => state.searchFilter;
export const getExplorerFilter = (state: State) => state.explorerFilter;

// We don't consider a filter active if the a search
// or a sorting direction has been provided
export const searchFilterIsEmpty = (state: State) =>
  isEqual(
    {
      ...state.searchFilter,
      sort: {},
      allUntagged: false,
      search: "",
      recursive: false,
    },
    { ...searchReducer.initialState, sort: {}, search: "", recursive: false }
  );

import { combineReducers } from "redux";
import * as ticketFilter from "./ticketFilter";
import * as searchFilter from "./searchFilter";
import * as explorerFilter from "./explorerFilter";

export default combineReducers({
  ticketFilter: ticketFilter.reducer,
  searchFilter: searchFilter.reducer,
  explorerFilter: explorerFilter.reducer,
});

export interface State {
  ticketFilter: ticketFilter.State;
  searchFilter: searchFilter.State;
  explorerFilter: explorerFilter.State;
}

import { combineReducers } from "redux";
import * as removedTickets from "./removedTickets";
import * as addedTickets from "./addedTickets";
import * as priorities from "./priorities";
import * as projections from "./projections";
import * as projectionsRequireRefresh from "./projectionsRequireRefresh";
import * as projectionSorting from "./projectionSorting";

export default combineReducers({
  addedTickets: addedTickets.reducer,
  removedTickets: removedTickets.reducer,
  priorities: priorities.reducer,
  projections: projections.reducer,
  projectionsRequireRefresh: projectionsRequireRefresh.reducer,
  projectionSorting: projectionSorting.reducer,
});

export interface State {
  addedTickets: addedTickets.State;
  removedTickets: removedTickets.State;
  priorities: priorities.State;
  projections: projections.State;
  projectionsRequireRefresh: projectionsRequireRefresh.State;
  projectionSorting: projectionSorting.State;
}

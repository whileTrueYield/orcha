import { combineReducers } from "redux";
import * as showArchivedProjects from "./showArchivedProjects";
import * as openedProjects from "./openedProjects";

export default combineReducers({
  showArchivedProjects: showArchivedProjects.reducer,
  openedProjects: openedProjects.reducer,
});

export interface State {
  showArchivedProjects: showArchivedProjects.State;
  openedProjects: openedProjects.State;
}

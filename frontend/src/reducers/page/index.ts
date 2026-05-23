import { combineReducers } from "redux";
import * as page from "./page";

export default combineReducers({
  page: page.reducer,
});

export interface State {
  page: page.State;
}

import { combineReducers } from "redux";
import * as selectedItems from "./selection";

export default combineReducers({
  selectedItems: selectedItems.reducer,
});

export interface State {
  selectedItems: selectedItems.State;
}

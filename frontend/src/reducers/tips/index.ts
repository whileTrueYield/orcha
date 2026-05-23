import { combineReducers } from "redux";
import * as tips from "./tips";

export default combineReducers({
  tips: tips.reducer,
});

export interface State {
  tips: tips.State;
}

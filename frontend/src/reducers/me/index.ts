import { combineReducers } from "redux";
import * as me from "./me";
import * as featureFlag from "./featureFlag";

export default combineReducers({
  me: me.reducer,
  featureFlag: featureFlag.reducer,
});

export interface State {
  me: me.State;
  featureFlag: featureFlag.State;
}

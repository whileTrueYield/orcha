import { combineReducers } from "redux";
import * as showTicket from "./showTicket";

export default combineReducers({
  showTicket: showTicket.reducer,
});

export interface State {
  showTicket: showTicket.State;
}

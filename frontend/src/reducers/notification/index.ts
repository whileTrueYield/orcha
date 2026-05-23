import { combineReducers } from "redux";
import * as notifications from "./notifications";
import * as lastNotifications from "./lastNotifications";
import * as versionNotification from "./versionNotification";

export default combineReducers({
  notifications: notifications.reducer,
  lastNotifications: lastNotifications.reducer,
  versionNotification: versionNotification.reducer,
});

export interface State {
  notifications: notifications.State;
  lastNotifications: lastNotifications.State;
  versionNotification: versionNotification.State;
}

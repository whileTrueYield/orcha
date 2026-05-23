import { State } from "./index";

export const getNotifications = (state: State) => state.notifications;
export const getLastNotifications = (state: State) => state.lastNotifications;
export const isNewVersionAvailable = (state: State) =>
  state.versionNotification;

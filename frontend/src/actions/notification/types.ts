import { DismissNotificationAction } from "./dismissNotification";
import { CreateNotificationAction } from "./createNotification";
import { NewVersionNotificationAction } from "./versionNotification";

export type NOTIFICATION_ACTION_TYPES =
  | DismissNotificationAction
  | CreateNotificationAction
  | NewVersionNotificationAction;

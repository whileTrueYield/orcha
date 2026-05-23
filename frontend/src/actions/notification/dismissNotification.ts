import { ActionWithPayload } from "../actionTypes";

export type DismissNotificationAction = ActionWithPayload<
  "DISMISS_NOTIFICATION",
  number
>;

export const dismissNotification = (
  payload: number
): DismissNotificationAction => ({
  type: "DISMISS_NOTIFICATION",
  payload,
});

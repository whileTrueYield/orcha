import { ActionWithPayload } from "../actionTypes";
import { NotificationType } from "../../types";

export type CreateNotificationAction = ActionWithPayload<
  "CREATE_NOTIFICATION",
  Notification
>;

let notificationIndex = 0;

interface NotificationParams {
  type: NotificationType;
  title: string;
  subTitle?: string;
  href?: string;
  duration?: number;
}

interface Notification extends NotificationParams {
  index: number;
}

export const createNotification = (
  payload: NotificationParams
): CreateNotificationAction => ({
  type: "CREATE_NOTIFICATION",
  payload: {
    index: notificationIndex++,
    ...payload,
  },
});

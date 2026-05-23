import { NotificationType, Notification } from "types";

interface NotificationArg {
  index: number;
  type: NotificationType;
  title: string;
  subTitle?: string;
  href?: string;
  duration?: number;
}

export const createNotification = (notification: NotificationArg) => {
  switch (notification.type) {
    case "Error":
      return errorNotification(notification);
    case "Warning":
      return warningNotification(notification);
    case "Success":
      return successNotification(notification);
    case "Info":
    default:
      return infoNotification(notification);
  }
};

export const successNotification = (
  notification: NotificationArg
): Notification => ({
  ...notification,
  type: "Success",
});

export const warningNotification = (
  notification: NotificationArg
): Notification => ({
  ...notification,
  type: "Warning",
});

export const errorNotification = (
  notification: NotificationArg
): Notification => ({
  ...notification,
  type: "Error",
});

export const infoNotification = (
  notification: NotificationArg
): Notification => ({
  ...notification,
  type: "Info",
});

import { slice, uniq } from "lodash";
import { Notification } from "types/graphql";
import { GetUrlForNotification } from "./GetUrlForNotification";

// return new if the notification is to be considered new
export const isNewNotification = (notification: Notification): boolean => {
  let isNew = true;
  let notificationsIds: number[] = [];

  try {
    const notificationStr = localStorage.getItem("orchaPastNotificationIds");
    if (notificationStr) {
      notificationsIds = JSON.parse(notificationStr);
      isNew = notificationsIds.indexOf(notification.id) === -1;
    }
  } catch (error) {
    console.error(error);
  }

  localStorage.setItem(
    "orchaPastNotificationIds",
    JSON.stringify(slice(uniq([notification.id, ...notificationsIds]), 0, 100))
  );

  return isNew;
};

export const createDesktopNotification = (notification: Notification) => {
  const desktopNotification = new window.Notification(`Orcha`, {
    body: notification.title.replace("{}", notification.actor.name),
    icon: window.location.origin + "/favicon.png",
  });

  desktopNotification.onclick = () => {
    window.open(
      window.location.origin + GetUrlForNotification(notification),
      "_blank"
    );
  };
};

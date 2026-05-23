import { Notification, NotificationTarget } from "types/graphql";
import { urlResolver } from "utils/navigation";

export const GetUrlForNotification = (notification: Notification): string => {
  const urlSearchParams = new URLSearchParams(notification.ancestry || "");
  const urlParams = Object.fromEntries(urlSearchParams.entries());

  urlSearchParams.append("notificationId", notification.id.toString());
  urlSearchParams.append("target", notification.target.toString());
  urlSearchParams.append("targetId", notification.targetId.toString());
  urlSearchParams.append("isRead", notification.isRead.toString());

  switch (notification.target) {
    case NotificationTarget.Ticket:
      return (
        urlResolver.ticket.view(
          String(notification.organizationId),
          notification.targetId
        ) +
        "?" +
        urlSearchParams
      );
    case NotificationTarget.Project:
      return (
        urlResolver.explorer.editor(
          String(notification.organizationId),
          notification.targetId
        ) +
        "?" +
        urlSearchParams
      );
    case NotificationTarget.Comment:
      return (
        urlResolver.ticket.view(
          String(notification.organizationId),
          parseInt(urlParams["ticket"], 10)
        ) +
        "?" +
        urlSearchParams
      );
    case NotificationTarget.Reply:
      return (
        urlResolver.ticket.view(
          String(notification.organizationId),
          parseInt(urlParams["ticket"], 10)
        ) +
        "?" +
        urlSearchParams
      );
    default:
      return "";
  }
};

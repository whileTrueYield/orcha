import { gql, useMutation } from "@apollo/client";
import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { MutationReadNotificationArgs } from "types/graphql";
import { MutationReturnValue } from "types/queryTypes";

function requestNotificationPermission() {
  if (Notification.permission !== "denied") {
    Notification.requestPermission();
  }
}

export const ReadNotificationMiddleware: React.FC = (props) => {
  const history = useHistory();

  const [readNotification] = useMutation<
    MutationReturnValue["readNotification"],
    MutationReadNotificationArgs
  >(MARK_NOTIFICATION_READ);

  // Mark a notification as read when visiting a notification url
  useEffect(() => {
    const urlSearchParams = new URLSearchParams(history.location.search);
    const urlParams = Object.fromEntries(urlSearchParams.entries());
    if (urlParams.notificationId && urlParams.isRead === "false") {
      const notificationId = parseInt(urlParams.notificationId, 10);

      // mark the notation as read after 3 seconds and update the URL to
      // to prevent redondant read updates
      const readTimeout = setTimeout(() => {
        readNotification({ variables: { notificationId } }).then(() => {
          requestNotificationPermission();
          urlSearchParams.set("isRead", "true");
          history.replace(window.location.pathname + "?" + urlSearchParams);
        });
      }, 3000);

      return () => {
        clearTimeout(readTimeout);
      };
    }
  }, [readNotification, history, history.location.search]);

  return null;
};

const MARK_NOTIFICATION_READ = gql`
  mutation MarkNotificationRead($notificationId: Int!) {
    readNotification(notificationId: $notificationId) {
      id
      isRead
    }
  }
`;

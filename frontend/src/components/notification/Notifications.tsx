import React, { FC, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  getNotifications,
  getLastNotifications,
  isNewVersionAvailable,
} from "reducers/selector";
import { Notification } from "./Notification";
import { Transition } from "@headlessui/react";
import { findIndex } from "lodash";
import { dismissNotification as dismissNotificationAction } from "actions";
import { useAppDispatch } from "store";
import { NewVersionNotification } from "./NewVersionNotification";

interface Props {}

export const Notifications: FC<Props> = (props: Props) => {
  const [isTimeoutActive, setTimeoutActive] = useState(true);
  const [showReloadNotification, setShowReloadNotification] = useState(true);

  const dispatch = useAppDispatch();
  const lastNotifications = useSelector(getLastNotifications);
  const newVersionAvailable = useSelector(isNewVersionAvailable);
  const notifications = useSelector(getNotifications);

  // display warning about new version available every 30 minutes
  // after being dismissed
  useEffect(() => {
    if (showReloadNotification === false) {
      const timeout = setTimeout(
        () => setShowReloadNotification(true),
        30 * 60 * 1000
      );
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [setShowReloadNotification, showReloadNotification]);

  const dismissNotification = (notificationIndex: number) => () => {
    setTimeoutActive(true);
    dispatch(dismissNotificationAction(notificationIndex));
  };

  return (
    <div
      onMouseEnter={() => setTimeoutActive(false)}
      onMouseLeave={() => setTimeoutActive(true)}
      className="pointer-events-none fixed inset-0 z-50 flex flex-col items-end justify-end px-4 py-6 sm:items-end sm:justify-start sm:p-6"
    >
      {lastNotifications.map((notification) => (
        <Transition
          show={findIndex(notifications, { index: notification.index }) > -1}
          className="w-full max-w-sm"
          enter="transform ease-out duration-300 transition"
          enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
          enterTo="translate-y-0 opacity-100 sm:translate-x-0"
          leave="transition transform ease-in duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0 translate-x-32"
          key={notification.index}
        >
          <Notification
            notification={notification}
            timeoutActive={isTimeoutActive}
            dismiss={dismissNotification(notification.index)}
            duration={notification.duration}
          />
        </Transition>
      ))}
      {newVersionAvailable ? (
        <Transition
          show={showReloadNotification}
          className="w-full max-w-sm"
          enter="transform ease-out duration-300 transition"
          enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
          enterTo="translate-y-0 opacity-100 sm:translate-x-0"
          leave="transition transform ease-in duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0 translate-x-32"
        >
          <NewVersionNotification
            dismiss={() => setShowReloadNotification(false)}
          />
        </Transition>
      ) : null}
    </div>
  );
};

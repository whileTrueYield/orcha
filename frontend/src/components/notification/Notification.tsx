import React from "react";

import { Notification as NotificationType } from "types";
import { NOTIFICATION_DELAYS } from "config";
import { XIcon } from "@heroicons/react/outline";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from "@heroicons/react/solid";
import "./Notification.css";
import classnames from "classnames";

interface Props {
  notification: NotificationType;
  dismiss: () => void;
  timeoutActive: boolean;
  duration?: number;
}

export class Notification extends React.Component<Props> {
  dismissTimeout: any;

  componentDidMount() {
    if (this.props.timeoutActive) {
      this.startDismissTimeout();
    }
  }

  componentWillUnmount() {
    this.stopDismissTimeout();
  }

  startDismissTimeout() {
    // version notification is persistant, it needs to be
    // closed manually
    const duration =
      this.props.duration || NOTIFICATION_DELAYS[this.props.notification.type];
    this.dismissTimeout = setTimeout(this.props.dismiss, duration * 1000);
  }

  stopDismissTimeout() {
    clearTimeout(this.dismissTimeout);
  }

  componentDidUpdate(prevProps: Props) {
    const { timeoutActive } = this.props;
    if (prevProps.timeoutActive !== timeoutActive) {
      timeoutActive ? this.startDismissTimeout() : this.stopDismissTimeout();
    }
  }

  render() {
    const { notification, dismiss } = this.props;

    const renderIcon = () => {
      switch (notification.type) {
        case "Error":
          return <XCircleIcon className="h-6 w-6 text-red-400" />;
        case "Info":
          return <InformationCircleIcon className="h-6 w-6 text-blue-400" />;
        case "Success":
          return <CheckCircleIcon className="h-6 w-6 text-green-400" />;
        case "Warning":
          return <ExclamationCircleIcon className="h-6 w-6 text-orange-400" />;
        default:
          return null;
      }
    };

    const progressClass = classnames(
      "group-hover:hidden z-0 absolute inset-x-0 bottom-0 h-1",
      {
        "bg-red-400 animate-notification-error": notification.type === "Error",
        "bg-green-400 animate-notification-success":
          notification.type === "Success",
        "bg-sky-400 animate-notification-info": notification.type === "Info",
        "bg-orange-400 animate-notification-warning":
          notification.type === "Warning",

        // no progress on new version announcement, it's persistent
        // we also want to hide it when the timeout is not active anymore
        // which will reset the animation once the mouse moves out
        hidden: !this.props.timeoutActive || notification.type === "Version",
      }
    );

    const renderSubTitle = () => {
      if (!notification.subTitle) {
        return null;
      }

      if (notification.href) {
        return (
          <a
            href={notification.href}
            className="mt-1 text-sm text-brand-500 underline hover:text-brand-600 hover:no-underline"
          >
            {notification.subTitle}
          </a>
        );
      } else {
        return (
          <p className="mt-1 text-sm text-gray-500">{notification.subTitle}</p>
        );
      }
    };

    return (
      <div className="group pointer-events-auto mt-2 w-full transform rounded-lg bg-white shadow-lg transition duration-200 hover:scale-105">
        <div className="shadow-xs relative overflow-hidden rounded-lg">
          {notification.duration ? null : <div className={progressClass}></div>}
          <div className="relative z-10 p-4">
            <div className="flex items-start">
              <div className="shrink-0">{renderIcon()}</div>
              <div className="ml-3 w-0 flex-1 pt-0.5">
                <p className="text-sm font-medium leading-5 text-gray-900">
                  {notification.title}
                </p>
                {renderSubTitle()}
              </div>
              <div className="ml-4 flex shrink-0">
                <button
                  type="button"
                  onClick={dismiss}
                  className="inline-flex text-gray-400 transition duration-150 ease-in-out focus:text-gray-500 focus:outline-none"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

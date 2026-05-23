import { useEffect, useRef, useState } from "react";
import { gql, useQuery } from "@apollo/client";
import { FCWithFragments } from "types";
import { Notification } from "types/graphql";
import { Popover } from "@headlessui/react";
import { BellIcon } from "@heroicons/react/outline";
import cn from "classnames";
import { SmartTime } from "components/views/Time";
import { Link } from "react-router-dom";
import { reject } from "lodash";
import { Avatar } from "components/views/Avatar";
import { GetUrlForNotification } from "./GetUrlForNotification";
import { IconForNotification } from "./IconForNotification";
import { QueryReturnValue } from "types/queryTypes";

export const NotificationButton: FCWithFragments = (props) => {
  const [showUnread, setShowUnread] = useState<boolean>(true);
  const [hasUnread, setHasUnread] = useState(false);
  const panelButtonRef = useRef<HTMLButtonElement>(null);

  const { data, error, refetch } = useQuery<
    QueryReturnValue["myNotifications"]
  >(GET_MY_NOTIFICATIONS_QUERY, {
    fetchPolicy: "cache-and-network",
    pollInterval: 10000 * 60, // pull notifications every 10 minutes
    variables: {
      last: 20,
      offset: 0,
      unread: showUnread,
    },
    onCompleted: ({ myNotifications }) => {
      // only count the number of unread notifications to
      // detect if there is new unread notifications
      if (showUnread) {
        setHasUnread(reject(myNotifications.nodes, "isRead").length > 0);
      }
    },
  });

  useEffect(() => {
    const panelButton = panelButtonRef.current;
    if (panelButton) {
      const onClick = () => {
        refetch();
      };

      panelButton.addEventListener("click", onClick);

      return () => {
        panelButton.removeEventListener("click", onClick);
      };
    }
  }, [panelButtonRef, refetch]);

  if (error) {
    return null;
  }

  const notifications = data ? data.myNotifications.nodes : [];

  const renderNotifications = (notifications: Notification[]) => {
    if (notifications.length) {
      return notifications.map((notification) => (
        <div className="px-1" key={notification.id}>
          <Popover.Button
            as={Link}
            to={GetUrlForNotification(notification)}
            className={cn(
              "flex w-full flex-row items-start rounded-md py-2 px-3 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-brand-600",
              {
                "font-normal": notification.isRead,
                "font-medium": !notification.isRead,
              }
            )}
          >
            {notification.isRead ? (
              <div className="w-4"></div>
            ) : (
              <div className="mt-3 mr-2 h-2 w-2 shrink-0 rounded-full bg-brand-600" />
            )}
            <div className="relative shrink-0">
              <Avatar
                className="h-8 w-8 shrink-0 rounded-md"
                src={notification.actor.avatarUrl}
                name={notification.actor.name}
              />
              <IconForNotification target={notification.target} />
            </div>
            <div className="flex flex-1 flex-col pl-4">
              <div className="text-brand-800">
                {notification.title.replace("{}", notification.actor.name)}
              </div>
              <div className="text-xs font-normal text-gray-500">
                <SmartTime date={notification.createdAt} />
              </div>
            </div>
          </Popover.Button>
        </div>
      ));
    } else {
      return (
        <div className="flex flex-col space-y-2 py-8 text-center text-gray-400">
          {showUnread ? (
            <>
              <span>No New Notifications</span>
              <span
                role="button"
                onClick={() => setShowUnread(false)}
                className="text-sm text-sky-600 hover:text-sky-500 hover:underline"
              >
                Show all notifications
              </span>
            </>
          ) : (
            <span>No Notifications</span>
          )}
        </div>
      );
    }
  };

  return (
    <Popover as="div" className="ml-2 sm:ml-3">
      <Popover.Button
        ref={panelButtonRef}
        className="relative rounded-full bg-white p-1.5 text-gray-400 hover:bg-brand-100 hover:text-brand-700 focus:outline-none focus:ring focus:ring-brand-500 focus:ring-opacity-50 focus:ring-offset-2"
      >
        <span className="sr-only">Notifications</span>
        <BellIcon className="h-6 w-6" />
        {hasUnread ? (
          <div className="absolute right-1.5 top-1 h-2 w-2 rounded-full bg-brand-500">
            <div className="absolute inset-0 animate-ping-slow rounded-full bg-brand-500" />
          </div>
        ) : null}
      </Popover.Button>

      <Popover.Panel className="absolute left-[4vw] mt-2 w-[92vw] rounded-md bg-white pb-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:right-16 sm:left-auto sm:mt-2 sm:w-96">
        <>
          <div className="flex w-full flex-row justify-start border-b px-4 pt-2 text-sm shadow-sm">
            <button
              onClick={() => setShowUnread(true)}
              className={cn("mr-1 py-1 px-2 font-medium", {
                "border-b-2 border-brand-500 text-brand-600": showUnread,
                "text-gray-500": !showUnread,
              })}
            >
              Unread
            </button>
            <button
              onClick={() => setShowUnread(false)}
              className={cn("py-1 px-2 font-medium", {
                "border-b-2 border-brand-500 text-brand-600": !showUnread,
                "text-gray-500": showUnread,
              })}
            >
              All
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto sm:max-h-64">
            {renderNotifications(notifications)}
          </div>
        </>
      </Popover.Panel>
    </Popover>
  );
};

NotificationButton.fragments = {
  NotificationButtonFragment: gql`
    fragment NotificationButtonFragment on Notification {
      id
      createdAt
      title
      isRead
      target
      targetId
      ancestry
      organizationId
      actor {
        id
        name
        avatarUrl
      }
    }
  `,
};

const GET_MY_NOTIFICATIONS_QUERY = gql`
  query GetMyNotifications($last: Int!, $offset: Int, $unread: Boolean) {
    myNotifications(last: $last, offset: $offset, unread: $unread) {
      totalCount
      nodes {
        id
        ...NotificationButtonFragment
      }
    }
  }
  ${NotificationButton.fragments.NotificationButtonFragment}
`;

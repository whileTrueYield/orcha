import { ChatAlt2Icon, HashtagIcon, ReplyIcon } from "@heroicons/react/solid";
import React from "react";
import { NotificationTarget } from "types/graphql";

interface Props {
  target: string;
}

export const IconForNotification: React.FC<Props> = (props) => {
  const { target } = props;

  switch (target) {
    case NotificationTarget.Ticket:
      return (
        <div className="absolute -bottom-1.5 -right-2 rounded-full border-2 border-white bg-brand-600 p-0.5">
          <HashtagIcon className="h-4 w-4 text-white" />
        </div>
      );
    case NotificationTarget.Comment:
      return (
        <div className="absolute -bottom-1.5 -right-2 rounded-full border-2 border-white bg-purple-600 p-0.5">
          <ChatAlt2Icon className="h-4 w-4 text-white" />
        </div>
      );

    case NotificationTarget.Reply:
      return (
        <div className="absolute -bottom-1.5 -right-2 rounded-full border-2 border-white bg-yellow-600 p-0.5">
          <ReplyIcon className="h-4 w-4 text-white" />
        </div>
      );
    default:
      return null;
  }
};

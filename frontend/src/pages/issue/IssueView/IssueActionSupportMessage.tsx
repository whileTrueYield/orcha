import { ChatAltIcon } from "@heroicons/react/outline";
import { ChatIcon } from "@heroicons/react/solid";
import { Avatar } from "components/views/Avatar";
import { SmartTime } from "components/views/Time";
import React from "react";
import { Issue, IssueAction, IssueActionCategory } from "types/graphql";

interface Props {
  action: IssueAction;
  issue: Issue;
}

export const IssueActionSupportMessage: React.FC<Props> = (props) => {
  const { action } = props;
  const body = action.body || "";

  if (action.category !== IssueActionCategory.SupportMessage) {
    console.warn(
      "IssueActionSupportMessage was used to display a",
      action.category
    );
    return null;
  }

  if (action.author) {
    return (
      <>
        <div>
          <div className="relative">
            <Avatar
              className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-400 ring-8 ring-white"
              src={action.author.avatarUrl}
              name={action.author.name}
              alt=""
            />
            <span className="absolute -bottom-0.5 -right-1 rounded-tl-md bg-white px-0.5 py-px">
              <ChatIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </span>
          </div>
        </div>
        <div className="min-w-0 flex-1 rounded-md bg-gray-100 px-4 py-2">
          <div>
            <div className="text-sm">
              <span className="font-medium text-gray-900">
                {action.author.name}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-gray-500">
              Sent a reply
              <SmartTime date={action.createdAt} className="ml-1" />
            </p>
          </div>
          <div className="mt-2 space-y-4 text-sm text-gray-700">
            {body.split("\n").map((paragraph, index) => (
              <p key={index} className="leading-6">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 ring-8 ring-white">
          <ChatAltIcon className="h-5 w-5 text-brand-500" aria-hidden="true" />
        </div>
      </div>
      <div className="min-w-0 flex-1 rounded-md bg-gray-100 px-4 py-2">
        <div>
          <div className="text-sm">
            <span className="font-medium text-gray-900">Someone</span>
          </div>
          <p className="mt-0.5 text-sm text-gray-500">
            Sent a reply
            <SmartTime date={action.createdAt} className="ml-1" />
          </p>
        </div>
        <div className="mt-2 space-y-4 text-sm text-gray-700">
          {body.split("\n").map((paragraph, index) => (
            <p key={index} className="leading-6">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </>
  );
};

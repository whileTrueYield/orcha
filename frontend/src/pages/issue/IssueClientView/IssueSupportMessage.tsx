import { ChatAltIcon } from "@heroicons/react/outline";
import { Avatar } from "components/views/Avatar";
import { SmartTime } from "components/views/Time";
import React from "react";
import { IssueAction, Issue } from "types/graphql";

interface Props {
  issueAction: IssueAction;
  issue: Issue;
}

export const IssueSupportMessage: React.FC<Props> = (props) => {
  const { issueAction } = props;

  const body = issueAction.body || "";

  if (issueAction.author) {
    return (
      <>
        <div>
          <Avatar
            className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-400 ring-8 ring-white"
            src={issueAction.author?.avatarUrl}
            name={issueAction.author?.name}
            alt=""
          />
        </div>
        <div className="min-w-0 flex-1 rounded-md bg-brand-100 px-4 py-2">
          <div>
            <div className="text-sm">
              <span className="text-gray-900">
                <span className="font-medium">{issueAction.author.name}</span>
              </span>
            </div>
            <p className="mt-0.5 text-sm text-gray-500">
              <span className="hidden sm:inline">replied </span>
              <SmartTime date={issueAction.createdAt} />
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
  } else {
    return (
      <>
        <div>
          <div className="relative px-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 ring-8 ring-white">
              <ChatAltIcon
                className="h-5 w-5 text-green-500"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div>
            <div className="text-sm">
              <span className="text-gray-900">
                <span className="font-medium">Someone</span>
              </span>
            </div>
            <p className="mt-0.5 text-sm text-gray-500">
              sent a new message
              <SmartTime date={issueAction.createdAt} className="ml-1" />
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
};

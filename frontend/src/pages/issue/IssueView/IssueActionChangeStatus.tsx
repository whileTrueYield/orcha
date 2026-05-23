import { SwitchHorizontalIcon } from "@heroicons/react/outline";
import { Avatar } from "components/views/Avatar";
import { SmartTime } from "components/views/Time";
import React from "react";
import { Issue, IssueAction, IssueActionCategory } from "types/graphql";

interface Props {
  action: IssueAction;
  issue: Issue;
}

export const IssueActionChangeStatus: React.FC<Props> = (props) => {
  const { action } = props;

  if (action.category !== IssueActionCategory.ChangeStatus) {
    console.warn(
      "IssueActionChangeStatus was used to display a",
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
              src={action.author?.avatarUrl}
              name={action.author?.name}
              alt=""
            />
            <span className="absolute -bottom-0.5 -right-1 rounded-tl-md bg-white px-0.5 py-px">
              <SwitchHorizontalIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </div>
        </div>
        <div className="min-w-0 flex-1 py-2.5">
          <div className="text-sm text-gray-500">
            <span className="mr-1 font-medium text-gray-900">
              {action.author?.name}
            </span>
            {action.title}
            <span className="ml-2 whitespace-nowrap">
              <SmartTime date={action.createdAt} />
            </span>
          </div>
        </div>
      </>
    );
  } else {
    return (
      <>
        <div>
          <div className="relative px-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 ring-8 ring-white">
              <SwitchHorizontalIcon
                className="h-5 w-5 text-gray-500"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
        <div className="min-w-0 flex-1 py-2">
          <div className="text-sm text-gray-500">
            {action.title}
            <span className="ml-2 whitespace-nowrap">
              <SmartTime date={action.createdAt} />
            </span>
          </div>
        </div>
      </>
    );
  }
};

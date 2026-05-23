import { UserIcon } from "@heroicons/react/solid";
import { Avatar } from "components/views/Avatar";
import { SmartTime } from "components/views/Time";
import React from "react";
import { IssueAction, IssueActionCategory } from "types/graphql";

interface Props {
  action: IssueAction;
}

export const IssueActionAssignee: React.FC<Props> = (props) => {
  const { action } = props;

  if (action.category !== IssueActionCategory.SetAssignee) {
    console.warn("IssueActionAssignee was used to display a", action.category);
    return null;
  }

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
            <UserIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
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
};

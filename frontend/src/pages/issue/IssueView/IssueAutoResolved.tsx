import { CheckIcon } from "@heroicons/react/outline";
import { SmartTime } from "components/views/Time";
import React from "react";
import { IssueAction, IssueActionCategory } from "types/graphql";

interface Props {
  action: IssueAction;
}

export const IssueAutoResolved: React.FC<Props> = (props) => {
  const { action } = props;

  if (action.category !== IssueActionCategory.AutoResolved) {
    console.warn("IssueAutoResolved was used to display a", action.category);
    return null;
  }

  return (
    <>
      <div>
        <div className="relative px-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 ring-8 ring-white">
            <CheckIcon className="h-5 w-5 text-green-600" aria-hidden="true" />
          </div>
        </div>
      </div>
      <div className="min-w-0 flex-1 py-2">
        <div className="text-sm text-green-700">
          {action.title}
          <span className="ml-1 whitespace-nowrap">
            <SmartTime date={action.createdAt} />
          </span>
        </div>
      </div>
    </>
  );
};

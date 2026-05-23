import { CheckIcon } from "@heroicons/react/outline";
import { SmartTime } from "components/views/Time";
import React from "react";
import { IssueAction, Issue } from "types/graphql";

interface Props {
  issueAction: IssueAction;
  issue: Issue;
}

export const IssueAutoResolved: React.FC<Props> = (props) => {
  const { issueAction } = props;

  return (
    <>
      <div>
        <div className="relative px-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 ring-8 ring-white">
            <CheckIcon className="h-5 w-5 text-green-500" aria-hidden="true" />
          </div>
        </div>
      </div>
      <div className="min-w-0 flex-1 rounded-md bg-green-100 px-4 py-2">
        <div>
          <div className="text-sm">
            <span className="text-green-900">
              <span className="font-medium">Orcha Bot</span>
            </span>
          </div>
          <p className="mt-0.5 text-sm text-gray-500">
            <span className="mr-1 hidden sm:inline">resolved issue</span>
            <SmartTime date={issueAction.createdAt} />
          </p>
        </div>
        <div className="mt-2 space-y-4 text-sm text-gray-700">
          <p className="leading-6">
            This issue has been marked resolved due to prolonged inactivity.
          </p>
        </div>
      </div>
    </>
  );
};

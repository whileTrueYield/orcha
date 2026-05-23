import { CameraIcon } from "@heroicons/react/outline";
import { SmartTime } from "components/views/Time";
import React from "react";
import { IssueAction, Issue } from "types/graphql";

interface Props {
  issueAction: IssueAction;
  issue: Issue;
}

export const IssueClientImage: React.FC<Props> = (props) => {
  const { issueAction, issue } = props;

  const body = issueAction.body || "";

  return (
    <>
      <div>
        <div className="relative px-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 ring-8 ring-white">
            <CameraIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
          </div>
        </div>
      </div>
      <div className="min-w-0 flex-1 rounded-md bg-gray-100 px-4 py-2">
        <div>
          <div className="text-sm">
            <span className="text-gray-900">
              <span className="font-medium">me - {issue.name}</span>
              <span className="ml-2 hidden text-gray-700 sm:inline">
                &lt;{issue.email}&gt;
              </span>
            </span>
          </div>
          <p className="mt-0.5 text-sm text-gray-500">
            <span className="mr-1 hidden sm:inline">sent a new image</span>
            <SmartTime date={issueAction.createdAt} />
          </p>
        </div>
        <div className="mt-2 space-y-4 text-sm text-gray-700">
          <img src={body} alt="client upload" className="image-embed" />
        </div>
      </div>
    </>
  );
};

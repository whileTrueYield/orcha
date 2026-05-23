import { CameraIcon } from "@heroicons/react/outline";
import { SmartTime } from "components/views/Time";
import React from "react";
import { Issue, IssueAction, IssueActionCategory } from "types/graphql";

interface Props {
  action: IssueAction;
  issue: Issue;
}

export const IssueActionClientImage: React.FC<Props> = (props) => {
  const { action, issue } = props;
  const body = action.body || "";

  if (action.category !== IssueActionCategory.ClientImage) {
    console.warn(
      "IssueActionClientImage was used to display a",
      action.category
    );
    return null;
  }

  return (
    <>
      <div>
        <div className="relative px-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 ring-8 ring-white">
            <CameraIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
          </div>
        </div>
      </div>
      <div className="min-w-0 flex-1 rounded-md bg-brand-100 px-4 py-2">
        <div>
          <div className="text-sm">
            <span className="font-medium text-gray-900">
              {issue.name}
              <span className="ml-2 font-mono text-gray-600">
                &lt;{issue.email}&gt;
              </span>
            </span>
          </div>
          <p className="mt-0.5 text-sm text-gray-500">
            Sent a new image
            <SmartTime date={issue.createdAt} className="ml-1" />
          </p>
        </div>
        <div className="mt-2 space-y-4 text-sm text-gray-700">
          <img src={body} alt="client upload" className="image-embed" />
        </div>
      </div>
    </>
  );
};

import React from "react";
import { gql } from "@apollo/client";
import { SmartTime } from "components/views/Time";
import { Link, useParams } from "react-router-dom";
import { FCWithFragments } from "types";
import { Issue } from "types/graphql";
import { urlResolver } from "utils/navigation";

interface Props {
  issue: Issue;
  className?: string;
}

export const IssueInfo: FCWithFragments<Props> = (props) => {
  const { orgId } = useParams<{ orgId: string }>();
  const { className, issue } = props;

  return (
    <div className={className}>
      <Link
        to={urlResolver.product.view(orgId, issue.product.id)}
        className="mt-4 block text-base text-gray-700 hover:underline"
      >
        {issue.product.name}
      </Link>
      <div className="text-sm text-gray-500">Product</div>

      <Link
        to={urlResolver.issue.clientView(issue.token)}
        className="mt-4 block truncate text-base text-gray-700 hover:underline"
      >
        {issue.token}
      </Link>
      <div className="text-sm text-gray-500">Client Access Link</div>

      <div className="mt-4 block truncate text-base text-gray-700">
        {issue.url || "N/A"}
      </div>
      <div className="text-sm text-gray-500">URL</div>

      <div className="mt-4 border-b"></div>

      <div className="mt-4 block text-base text-gray-700">
        {issue.context.os || "N/A"}
        <span className="ml-1 text-sm text-gray-600">
          / {issue.context.osVersion}
        </span>
      </div>
      <div className="text-sm text-gray-500">Operating System / version</div>

      <div className="mt-4 block text-base text-gray-700">
        {issue.context.browser || "N/A"}
        <span className="ml-1 text-sm text-gray-600">
          / {issue.context.engine || "N/A"}
        </span>
      </div>
      <div className="text-sm text-gray-500">Browser / Engine</div>

      <div className="mt-4 block text-base text-gray-700">
        {issue.context.deviceName || "N/A"}
      </div>
      <div className="text-sm text-gray-500">Device</div>

      <div className="mt-4 block text-base text-gray-700">
        {issue.context.deviceType || "N/A"}
      </div>
      <div className="text-sm text-gray-500">Device Type</div>

      <div className="mt-4 border-b"></div>

      <div className="mt-4 block text-base text-gray-700">{issue.name}</div>
      <div className="text-sm text-gray-500">Author</div>

      <div className="mt-4 block text-base text-gray-700">{issue.email}</div>
      <div className="text-sm text-gray-500">Author's Email</div>

      <div className="mt-4 text-base text-gray-700">
        <SmartTime date={issue.createdAt} />
      </div>
      <div className="text-sm text-gray-500">Creation date</div>
    </div>
  );
};

IssueInfo.fragments = {
  IssueInfoFragment: gql`
    fragment IssueInfoFragment on Issue {
      id
      token
      url
      status
      email
      name
      unread
      createdAt
      product {
        id
        name
      }
      context {
        deviceName
        deviceType
        os
        osVersion
        browser
        engine
      }
    }
  `,
};

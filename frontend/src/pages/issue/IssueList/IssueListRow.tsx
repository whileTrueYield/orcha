import React from "react";
import { Link } from "react-router-dom";
import { Issue } from "types/graphql";
import { formatDistanceToNow } from "date-fns";
import { SmartTime } from "components/views/Time";
import { IssueStatusBadge } from "./IssueStatusBadge";
import { urlResolver } from "utils/navigation";
import { FCWithFragments } from "types";
import { gql } from "@apollo/client";

interface Props {
  issue: Issue;
  index: number;
  url: string;
}

export const IssueListRow: FCWithFragments<Props> = (props) => {
  const { issue } = props;

  const regularCell =
    "px-6 py-4 whitespace-nowrap text-sm leading-5 text-gray-500";

  return (
    <tr>
      <td className="w-9">
        <div className="flex flex-row items-center justify-center p-3">
          {issue.unread ? (
            <span
              title="unread"
              className="block h-3 w-3 rounded-full bg-brand-500"
            ></span>
          ) : (
            <span
              title="read"
              className="block h-3 w-3 rounded-full border"
            ></span>
          )}
        </div>
      </td>
      <td
        className={`py-1 pr-6 text-sm leading-5 ${
          issue.unread ? "font-semibold text-gray-600" : "text-gray-500"
        }`}
      >
        <Link
          to={urlResolver.issue.view(issue.organizationId.toString(), issue.id)}
          className="block min-w-[14rem] hover:underline"
        >
          <p className="line-clamp-3">{issue.description}</p>
        </Link>
      </td>
      <td className={regularCell}>
        <div className="font-medium text-gray-700">{issue.name}</div>
        {issue.email}
      </td>
      <td className={regularCell}>
        <div className="font-medium text-gray-700">
          {formatDistanceToNow(new Date(issue.createdAt), {
            addSuffix: true,
          })}
        </div>
        <SmartTime date={issue.createdAt} />
      </td>
      <td className={regularCell}>
        <IssueStatusBadge status={issue.status} />
      </td>
      <td className={regularCell}>{issue.product.code}</td>
      <td className={regularCell}>
        <div className="font-medium text-gray-700">{issue.assignee?.name}</div>
        {issue.assignee?.title}
      </td>
    </tr>
  );
};

IssueListRow.fragments = {
  IssueListRowFragment: gql`
    fragment IssueListRowFragment on Issue {
      id
      createdAt
      description
      organizationId
      status
      name
      email
      unread
      product {
        id
        code
      }
      assignee {
        id
        name
        title
        avatarUrl
      }
    }
  `,
};

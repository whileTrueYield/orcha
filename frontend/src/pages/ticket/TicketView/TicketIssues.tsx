import React from "react";
import { gql } from "@apollo/client";
import { capitalize, isEmpty, truncate } from "lodash";
import { Link, useParams } from "react-router-dom";
import { FCWithFragments } from "types";
import { Issue, IssueStatus, Ticket } from "types/graphql";
import { urlResolver } from "utils/navigation";
import { plural } from "utils/string";
import cn from "classnames";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  PlayIcon,
} from "@heroicons/react/solid";

interface Props {
  ticket: Ticket;
}

export const TicketIssues: FCWithFragments<Props> = (props) => {
  const { orgId } = useParams<{ orgId: string }>();

  if (isEmpty(props.ticket.issues)) {
    return null;
  }

  const getIconForStatus = (status: IssueStatus) => {
    switch (status) {
      case IssueStatus.New:
        return (
          <ExclamationCircleIcon className="h-5 w-5 shrink-0 text-yellow-500" />
        );
      case IssueStatus.Processing:
        return <PlayIcon className="h-5 w-5 shrink-0 text-brand-500" />;
      default:
        return <CheckCircleIcon className="h-5 w-5 shrink-0 text-green-500" />;
    }
  };

  const renderIssue = (issue: Issue) => {
    const issueClass = cn(
      "block w-full rounded-md py-1 px-2 flex flex-row items-center space-x-2 transition",
      {
        "text-yellow-600 bg-yellow-100 hover:bg-yellow-200 hover:text-yellow-700":
          issue.status === IssueStatus.New,
        "text-brand-600 bg-brand-100 hover:bg-brand-200 hover:text-brand-700":
          issue.status === IssueStatus.Processing,
        "text-green-600 bg-green-100 hover:bg-green-200 hover:text-green-700":
          issue.status === IssueStatus.Resolved,
      }
    );

    return (
      <li className="w-full" key={issue.id}>
        <Link
          title={`${capitalize(issue.status)}: ${truncate(issue.description, {
            length: 128,
          })}`}
          to={urlResolver.issue.view(orgId, issue.id)}
          className={issueClass}
        >
          {getIconForStatus(issue.status)}
          <span className="min-w-0 truncate">{issue.description}</span>
        </Link>
      </li>
    );
  };

  return (
    <>
      <div className="text-lg text-gray-700">
        {plural(
          "Related Support Issue ({})",
          "Related Support Issues ({})",
          props.ticket.issues
        )}
      </div>
      <ul className="mt-1 flex max-h-48 flex-col space-y-1 overflow-y-auto rounded-md border bg-white p-1 text-base shadow-inner">
        {props.ticket.issues.map(renderIssue)}
      </ul>
    </>
  );
};

TicketIssues.fragments = {
  TicketIssuesFragment: gql`
    fragment TicketIssuesFragment on Ticket {
      id
      issues {
        id
        localId
        description
        status
      }
    }
  `,
};

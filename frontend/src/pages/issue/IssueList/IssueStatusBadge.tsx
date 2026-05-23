import React from "react";
import { IssueStatus } from "types/graphql";
import { Tag } from "components/tags/Tag";

interface Props {
  status: IssueStatus;
  className?: string;
}

export const IssueStatusBadge: React.FC<Props> = (props) => {
  const { status } = props;

  switch (status) {
    case IssueStatus.New:
      return (
        <Tag className="bg-yellow-100 font-semibold uppercase tracking-wide text-yellow-700">
          New
        </Tag>
      );
    case IssueStatus.Processing:
      return (
        <Tag className="bg-sky-100 font-semibold uppercase tracking-wide text-sky-700">
          Processing
        </Tag>
      );
    case IssueStatus.Resolved:
      return (
        <Tag className="bg-green-100 font-semibold uppercase tracking-wide text-green-700">
          Resolved
        </Tag>
      );
    default:
      return null;
  }
};

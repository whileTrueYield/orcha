import { Tag, TagProps } from "components/tags/Tag";
import React from "react";
import { IssueStatus } from "types/graphql";

interface Props extends TagProps {
  status: IssueStatus;
}

export const IssueTag: React.FC<Props> = (props) => {
  const { status, className, ...tagProps } = props;
  switch (status) {
    case IssueStatus.New:
      return (
        <Tag
          className={`${props.className} bg-orange-100 font-semibold uppercase tracking-wide text-orange-700`}
          {...tagProps}
        >
          New
        </Tag>
      );
    case IssueStatus.Processing:
      return (
        <Tag
          className={`${props.className} bg-brand-100 font-semibold uppercase tracking-wide text-brand-700`}
          {...tagProps}
        >
          Processing
        </Tag>
      );
    case IssueStatus.Resolved:
      return (
        <Tag
          className={`${props.className} bg-green-100 font-semibold uppercase tracking-wide text-green-700`}
          {...tagProps}
        >
          Resolved
        </Tag>
      );
    default:
      return <Tag {...tagProps}>{status}</Tag>;
  }
};

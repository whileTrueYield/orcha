import React from "react";
import { gql } from "@apollo/client";
import { Avatar } from "components/views/Avatar";
import { RoleSelect } from "components/fields/RoleSelect";
import { FCWithFragments } from "types";
import { MutationUpdateIssueArgs, MiniRole, Issue, Role } from "types/graphql";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { XIcon } from "@heroicons/react/outline";
import { useBlockingMutation } from "utils/graphql";

interface Props {
  issue: Issue;
  className?: string;
}

export const IssueAssignee: FCWithFragments<Props> = (props) => {
  const { issue } = props;

  const clearAssignee = () => {
    updateIssue({
      variables: {
        issueId: issue.id,
        input: {
          assigneeId: null,
        },
      },
    });
  };

  const setAssignee = (role: MiniRole | null) => {
    if (role) {
      updateIssue({
        variables: {
          issueId: issue.id,
          input: {
            assigneeId: role.id,
          },
        },
      });
    }
  };

  const [updateIssue] = useBlockingMutation<
    { updateIssue: Issue },
    MutationUpdateIssueArgs
  >(MUTATE_UPDATE_ISSUE, {
    onError: onGraphQLError({ title: "Could not set issue lead" }),
    onCompleted: onMutationComplete({
      title: "Issue Lead Updated",
    }),
  });

  const renderAssignee = (assignee: Role) => (
    <div
      key={assignee.id}
      className="group my-1 flex flex-row items-center rounded-lg py-1 pr-2 pl-1 text-gray-700 transition duration-100 hover:bg-gray-200"
    >
      <Avatar
        src={assignee.avatarUrl}
        className="flex-0 mr-2 h-10 w-10 rounded-md border-2 border-white bg-gray-200 shadow"
        name={assignee.name}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="block truncate">{assignee.name}</span>
        <span className="truncate text-sm text-gray-500">{assignee.title}</span>
      </div>
      <button
        type="button"
        className="flex-0 inline-block rounded p-1 leading-4 text-gray-700 opacity-0 transition duration-100 hover:bg-gray-300 focus:outline-none focus:ring group-hover:opacity-100"
        onClick={() => clearAssignee()}
      >
        <XIcon className="h-4 w-4" />
      </button>
    </div>
  );

  if (issue.assignee) {
    return (
      <div className={props.className}>
        <div className="text-lg text-gray-700">Assignee</div>
        {renderAssignee(issue.assignee)}
      </div>
    );
  }

  return (
    <div className={props.className}>
      <div className="text-lg text-gray-700">Assignee</div>
      <RoleSelect
        placeholder="Select Assignee..."
        onChange={setAssignee}
        className="mt-1"
        includeMe
      />
    </div>
  );
};

IssueAssignee.fragments = {
  IssueAssigneeFragment: gql`
    fragment IssueAssigneeFragment on Issue {
      id
      assignee {
        id
        title
        type
        name
        avatarUrl
      }
    }
  `,
};

const MUTATE_UPDATE_ISSUE = gql`
  mutation UpdateIssueAssignee($input: UpdateIssueInput!, $issueId: Int!) {
    updateIssue(input: $input, issueId: $issueId) {
      ...IssueAssigneeFragment
    }
  }
  ${IssueAssignee.fragments.IssueAssigneeFragment}
`;

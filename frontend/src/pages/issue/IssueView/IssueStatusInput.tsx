import React, { useState } from "react";
import { gql } from "@apollo/client";
import { FCWithFragments } from "types";
import {
  Issue,
  IssueStatus,
  MutationIssueRemoveAutoResolveArgs,
  MutationIssueSetAutoResolveArgs,
  MutationUpdateIssueArgs,
} from "types/graphql";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { useBlockingMutation } from "utils/graphql";
import { Button } from "components/fields/Button";
import { ConfirmModal } from "components/modals/ConfirmModal";
import { WarningConfirm } from "components/modals/WarningConfirm";
import { SmartTime } from "components/views/Time";

interface Props {
  issue: Issue;
  className?: string;
}

export const IssueStatusInput: FCWithFragments<Props> = (props) => {
  const { issue } = props;

  const [isConfirmVisible, setConfirmVisible] = useState(false);
  const [isReopenConfirmVisible, setReopenConfirmVisible] = useState(false);

  const [updateIssue] = useBlockingMutation<
    { updateIssue: Issue },
    MutationUpdateIssueArgs
  >(MUTATE_UPDATE_ISSUE, {
    onError: onGraphQLError({ title: "Could not update issue" }),
    onCompleted: onMutationComplete({
      title: "Issue Updated",
    }),
  });

  const [issueRemoveAutoResolve] = useBlockingMutation<
    { updateIssue: Issue },
    MutationIssueRemoveAutoResolveArgs
  >(MUTATE_REMOVE_ISSUE_AUTO_RESOLVE, {
    onError: onGraphQLError({ title: "Could not remove auto resolve" }),
    onCompleted: onMutationComplete({
      title: "Auto resolved removed",
    }),
  });

  const [issueSetAutoResolve] = useBlockingMutation<
    { updateIssue: Issue },
    MutationIssueSetAutoResolveArgs
  >(MUTATE_SET_ISSUE_AUTO_RESOLVE, {
    onError: onGraphQLError({ title: "Could not set auto resolve" }),
    onCompleted: onMutationComplete({
      title: "Auto resolved set",
    }),
  });

  const renderAutoResolveInfo = () => {
    if (issue.status === IssueStatus.Resolved) {
      return null;
    }

    if (issue.resolveAfterDate) {
      return (
        <div className="mt-4 text-sm text-gray-600">
          if no replies by <SmartTime date={issue.resolveAfterDate} /> issue
          will be marked as resolved.{" "}
          <button
            type="button"
            onClick={() =>
              issueRemoveAutoResolve({ variables: { issueId: issue.id } })
            }
            className="text-brand-600 hover:text-brand-700 hover:underline"
          >
            Cancel auto-resolve
          </button>
        </div>
      );
    } else {
      return (
        <button
          type="button"
          onClick={() =>
            issueSetAutoResolve({ variables: { issueId: issue.id } })
          }
          className="mt-4 text-sm text-brand-600 hover:text-brand-700 hover:underline"
        >
          Click to activate auto-resolve
        </button>
      );
    }
  };

  return (
    <div className={props.className}>
      <ConfirmModal
        cta="Yes, Issue has been resolved"
        title="Mark the issue as resolved?"
        description="Marking this issue as resolved will prevent anyone from sending new messages."
        onConfirm={() =>
          updateIssue({
            variables: {
              issueId: issue.id,
              input: { status: IssueStatus.Resolved },
            },
          })
        }
        visible={isConfirmVisible}
        onClose={() => setConfirmVisible(false)}
      />

      <WarningConfirm
        cta="Yes, re-open issue"
        title="Re-open issue?"
        description="Re-opening this issue will allow new messages."
        onConfirm={() =>
          updateIssue({
            variables: {
              issueId: issue.id,
              input: { status: IssueStatus.Processing },
            },
          })
        }
        visible={isReopenConfirmVisible}
        onClose={() => setReopenConfirmVisible(false)}
      />

      <div className="mt-4 mb-1 flex flex-row items-center text-lg text-gray-700">
        Issue {issue.unread ? "is unread" : "has been read"}
        {issue.unread ? (
          <span className="ml-2 inline-block h-3 w-3 rounded-full bg-brand-500" />
        ) : (
          <span className="ml-2 inline-block h-3 w-3 rounded-full border border-gray-300" />
        )}
      </div>
      {issue.unread ? (
        <Button
          type="button"
          btnType="gray"
          block
          onClick={() =>
            updateIssue({
              variables: { issueId: issue.id, input: { unread: false } },
            })
          }
        >
          Mark as Read
        </Button>
      ) : (
        <Button
          type="button"
          btnType="white"
          block
          onClick={() =>
            updateIssue({
              variables: { issueId: issue.id, input: { unread: true } },
            })
          }
        >
          Mark as Unread
        </Button>
      )}

      <div className="mt-4 mb-1 text-lg text-gray-700">
        Issue is{" "}
        {issue.status === IssueStatus.Resolved ? "resolved" : "unresolved"}
      </div>
      {issue.status === IssueStatus.Resolved ? (
        <Button
          type="button"
          btnType="warning"
          block
          onClick={() => setReopenConfirmVisible(true)}
        >
          Re-open issue
        </Button>
      ) : (
        <Button
          type="button"
          btnType="white"
          block
          onClick={() => setConfirmVisible(true)}
        >
          Mark as Resolved
        </Button>
      )}

      {renderAutoResolveInfo()}
    </div>
  );
};

IssueStatusInput.fragments = {
  IssueStatusInputFragment: gql`
    fragment IssueStatusInputFragment on Issue {
      id
      status
      unread
      resolveAfterDate
    }
  `,
};

const MUTATE_UPDATE_ISSUE = gql`
  mutation UpdateIssueStatus($input: UpdateIssueInput!, $issueId: Int!) {
    updateIssue(input: $input, issueId: $issueId) {
      ...IssueStatusInputFragment
    }
  }
  ${IssueStatusInput.fragments.IssueStatusInputFragment}
`;

const MUTATE_REMOVE_ISSUE_AUTO_RESOLVE = gql`
  mutation IssueRemoveAutoResolve($issueId: Int!) {
    issueRemoveAutoResolve(issueId: $issueId) {
      ...IssueStatusInputFragment
    }
  }
  ${IssueStatusInput.fragments.IssueStatusInputFragment}
`;

const MUTATE_SET_ISSUE_AUTO_RESOLVE = gql`
  mutation IssueSetAutoResolve($issueId: Int!) {
    issueSetAutoResolve(issueId: $issueId) {
      ...IssueStatusInputFragment
    }
  }
  ${IssueStatusInput.fragments.IssueStatusInputFragment}
`;

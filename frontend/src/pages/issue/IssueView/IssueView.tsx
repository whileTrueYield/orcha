import React, { useEffect, useState } from "react";
import { gql, useQuery } from "@apollo/client";
import { usePageTitle } from "hooks/usePageTitle";
import { useParams } from "react-router-dom";
import { FCWithFragments } from "types";
import {
  Issue,
  IssueAction,
  IssueActionCategory,
  IssueStatus,
  MutationIssueAddNoteArgs,
  MutationIssueDeleteNoteArgs,
  MutationIssueSendMessageArgs,
  MutationIssueUpdateNoteArgs,
  MutationUpdateIssueArgs,
} from "types/graphql";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { EmptyState } from "components/views/EmtpyState";
import { SmartTime } from "components/views/Time";
import {
  Panel,
  PanelBody,
  PanelFooter,
  PanelHeader,
} from "components/views/Panel";
import { IssueTag } from "../components/IssueTag";
import { IssueAssignee } from "./IssueAssignee";
import { IssueInfo } from "./IssueInfo";
import {
  ChatAltIcon,
  InboxInIcon,
  PencilAltIcon,
} from "@heroicons/react/outline";
import { IssueActionAssignee } from "./IssueActionAssignee";
import { IssueActionClientMessage } from "./IssueActionClientMessage";
import { IssueActionChangeStatus } from "./IssueActionChangeStatus";
import { useBlockingMutation } from "utils/graphql";
import { IssueActionSupportMessage } from "./IssueActionSupportMessage";
import { IssueStatusInput } from "./IssueStatusInput";
import { IssueMessageForm } from "./IssueMessageForm";
import { IssueNoteForm } from "./IssueNoteForm";
import { IssueActionSupportNote } from "./IssueActionSupportNote";
import { useSelector } from "react-redux";
import { getMe } from "reducers/selector";
import { IssueActionTicket } from "./IssueActionTicket";
import { IssueTicket } from "./IssueTicket";
import { IssueAutoResolved } from "./IssueAutoResolved";
import { NoAccess } from "components/views/NoAccess";
import { IssueActionClientImage } from "./IssueActionClientImage";
import { IssueActionSupportImage } from "./IssueActionSupportImage";
import { QueryReturnValue } from "types/queryTypes";

interface TicketViewUrlParams {
  issueId: string;
}

export const IssueView: FCWithFragments = () => {
  const urlParams = useParams<TicketViewUrlParams>();
  const issueId = parseInt(urlParams.issueId);
  const [showForm, setShowForm] = useState<"message" | "note" | null>(null);
  const me = useSelector(getMe);

  usePageTitle("Issue View");

  const { data, loading, error } = useQuery<QueryReturnValue["issue"]>(
    GET_ISSUE_QUERY,
    {
      variables: {
        id: issueId,
      },
      onError: onGraphQLError({ title: "Could not retrieve issue" }),
    }
  );

  const [issueSendMessage] = useBlockingMutation<
    { issueSendMessage: Issue },
    MutationIssueSendMessageArgs
  >(SEND_MESSAGE_MUTATION, {
    onError: onGraphQLError({ title: "Could not send message" }),
    onCompleted: onMutationComplete({ title: "Message sent" }),
  });

  const [issueAddNote] = useBlockingMutation<
    { issueAddNote: Issue },
    MutationIssueAddNoteArgs
  >(ADD_NOTE_MUTATION, {
    onError: onGraphQLError({ title: "Could not add note" }),
    onCompleted: onMutationComplete({ title: "Note added" }),
  });

  const [issueUpdateNote] = useBlockingMutation<
    { issueUpdateNote: IssueAction },
    MutationIssueUpdateNoteArgs
  >(UPDATE_NOTE_MUTATION, {
    onError: onGraphQLError({ title: "Could not update note" }),
    onCompleted: onMutationComplete({ title: "Note updated" }),
  });

  const [issueDeleteNote] = useBlockingMutation<
    { issueDeleteNote: Issue },
    MutationIssueDeleteNoteArgs
  >(DELETE_NOTE_MUTATION, {
    onError: onGraphQLError({ title: "Could not delete note" }),
    onCompleted: onMutationComplete({ title: "Note deleted" }),
  });

  const [updateIssue] = useBlockingMutation<
    { updateIssue: Issue },
    MutationUpdateIssueArgs
  >(MUTATE_UPDATE_ISSUE);

  useEffect(() => {
    if (
      data?.issue.assignee?.id === me?.role?.id &&
      data?.issue.unread === true
    ) {
      const timeout = setTimeout(
        () => updateIssue({ variables: { issueId, input: { unread: false } } }),
        10 * 1000
      ); // mark as read after 10 seconds

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [
    issueId,
    data?.issue.unread,
    data?.issue.assignee?.id,
    me?.role?.id,
    updateIssue,
  ]);

  if (error) {
    return <NoAccess className="h-full" />;
  }

  if (loading) {
    return null;
  }

  if (!data) {
    return <EmptyState title="Issue not found..." />;
  }

  const onSubmitMessage = (input: { message?: string; imageUrl?: string }) => {
    issueSendMessage({
      variables: {
        issueId: issue.id,
        input,
      },
      onCompleted: () => setShowForm(null),
    });
  };

  const onSubmitNote = (note: string) => {
    issueAddNote({
      variables: {
        issueId: issue.id,
        input: { note },
      },
      onCompleted: () => setShowForm(null),
    });
  };

  const onUpdateNote = (issueActionId: number, note: string) => {
    issueUpdateNote({
      variables: {
        issueActionId,
        input: { note },
      },
    });
  };

  const onDeleteNote = (issueActionId: number) => {
    issueDeleteNote({
      variables: {
        issueActionId,
      },
    });
  };

  const issue = data.issue;

  const renderIssueAction = (issueAction: IssueAction) => {
    switch (issueAction.category) {
      case IssueActionCategory.SetTicket:
        return <IssueActionTicket action={issueAction} />;
      case IssueActionCategory.SetAssignee:
        return <IssueActionAssignee action={issueAction} />;
      case IssueActionCategory.AutoResolved:
        return <IssueAutoResolved action={issueAction} />;
      case IssueActionCategory.ClientMessage:
        return <IssueActionClientMessage issue={issue} action={issueAction} />;
      case IssueActionCategory.ClientImage:
        return <IssueActionClientImage issue={issue} action={issueAction} />;
      case IssueActionCategory.ChangeStatus:
        return <IssueActionChangeStatus issue={issue} action={issueAction} />;
      case IssueActionCategory.SupportMessage:
        return <IssueActionSupportMessage issue={issue} action={issueAction} />;
      case IssueActionCategory.SupportImage:
        return <IssueActionSupportImage issue={issue} action={issueAction} />;
      case IssueActionCategory.SupportNote:
        return (
          <IssueActionSupportNote
            onDelete={onDeleteNote}
            onUpdate={onUpdateNote}
            issue={issue}
            action={issueAction}
          />
        );
      default:
        return null;
    }
  };

  const renderMessageForm = () => {
    if (showForm) {
      if (showForm === "message") {
        return (
          <PanelFooter className="bg-brand-50">
            <IssueMessageForm
              issue={issue}
              onCancel={() => setShowForm(null)}
              onSave={onSubmitMessage}
            />
          </PanelFooter>
        );
      } else {
        return (
          <PanelFooter className="bg-yellow-50">
            <IssueNoteForm
              issue={issue}
              onCancel={() => setShowForm(null)}
              onSave={onSubmitNote}
            />
          </PanelFooter>
        );
      }
    } else {
      return (
        <PanelFooter className="">
          <div className="flex flex-row items-center justify-center">
            <div className="flex flex-1 flex-col items-center justify-center space-y-4 lg:flex-row lg:space-x-8 lg:space-y-0">
              <button
                type="button"
                onClick={() => setShowForm("note")}
                className="inline-flex w-full items-center justify-center rounded-md border border-transparent bg-yellow-100 px-4 py-2 text-base font-medium text-yellow-700 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 lg:w-auto"
              >
                <PencilAltIcon className="mr-1 inline h-5 w-5 text-yellow-600" />
                Add Note
              </button>

              <button
                type="button"
                onClick={() => setShowForm("message")}
                className="inline-flex w-full items-center justify-center rounded-md border border-transparent bg-sky-100 px-4 py-2 text-base font-medium text-sky-700 hover:bg-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 lg:w-auto"
              >
                <ChatAltIcon className="mr-1 inline h-5 w-5 text-sky-600" />
                New Message
              </button>
            </div>
          </div>
        </PanelFooter>
      );
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="pt-4 sm:mb-8 md:py-4">
        <div className="flex-row-reverse gap-x-6 pb-6 sm:flex sm:flex-row">
          <div className="mt-5 min-w-0 flex-1 sm:mt-0">
            <Panel>
              <PanelHeader>
                <h2 className="text-xl text-gray-800">
                  <span className="text-gray-500">From </span>
                  <span className="font-medium">{issue.name}</span>
                </h2>
                <div className="mt-2 flex flex-col space-y-2 text-sm text-gray-500 sm:flex-row sm:space-x-6 sm:space-y-0">
                  <div>
                    Case ID:{" "}
                    <span className="font-medium text-gray-700">
                      {issue.localId}
                    </span>
                  </div>
                  <div>
                    Created{" "}
                    <span className="font-medium text-gray-700">
                      <SmartTime date={issue.createdAt} />
                    </span>
                  </div>
                  <div>
                    <IssueTag status={issue.status} />
                  </div>
                </div>
              </PanelHeader>
              <PanelBody>
                <div className="mb-6 text-center text-sm text-gray-500">
                  Client messages appear in
                  <span className="ml-1 rounded bg-brand-200 px-1 py-px text-gray-600">
                    blue
                  </span>
                </div>
                <div className="flow-root">
                  <ul className="-mb-8">
                    <li>
                      <div className="relative pb-8">
                        {issue.issueActions.length > 0 && (
                          <span
                            className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200"
                            aria-hidden="true"
                          />
                        )}
                        <div className="relative flex items-start space-x-3">
                          <div>
                            <div className="relative px-1">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 ring-8 ring-white">
                                <InboxInIcon
                                  className="h-5 w-5 text-brand-50"
                                  aria-hidden="true"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="min-w-0 flex-1 rounded-md bg-brand-100 px-4 py-2">
                            <div>
                              <div className="text-sm">
                                From:{" "}
                                <span className="font-medium text-gray-900">
                                  {issue.name}
                                  <span className="ml-2 font-mono text-gray-600">
                                    &lt;{issue.email}&gt;
                                  </span>
                                </span>
                              </div>
                              <p className="mt-0.5 text-sm text-gray-500">
                                Support request received
                                <SmartTime
                                  date={issue.createdAt}
                                  className="ml-1"
                                />
                              </p>
                            </div>
                            <div className="mt-2 space-y-4 text-sm text-gray-700">
                              {issue.description
                                .split("\n")
                                .map((paragraph, index) => (
                                  <p key={index} className="leading-6">
                                    {paragraph}
                                  </p>
                                ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                    {issue.issueActions.map((issueAction, index) => (
                      <li key={issueAction.id}>
                        <div className="relative pb-8">
                          {index < issue.issueActions.length - 1 ? (
                            <span
                              className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200"
                              aria-hidden="true"
                            />
                          ) : null}
                          <div className="relative flex items-start space-x-3">
                            {renderIssueAction(issueAction)}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </PanelBody>

              {issue.status !== IssueStatus.Resolved ? (
                renderMessageForm()
              ) : (
                <PanelFooter className="bg-green-50">
                  <div className="flex flex-col items-center justify-center text-center text-green-800">
                    <div className="text-base font-semibold">
                      This issue is resolved
                    </div>
                    <div className="mt-1 text-sm">messages are disabled</div>
                  </div>
                </PanelFooter>
              )}
            </Panel>
          </div>
          <div className="mt-5 min-w-0 flex-1 px-4 sm:mt-0 sm:w-80 sm:flex-none sm:px-0 md:w-72 lg:w-96">
            <IssueTicket issue={issue} />
            <IssueAssignee issue={issue} className="mt-4" />
            <IssueStatusInput issue={issue} className="mt-4" />
            <div className="mt-4 border-t-2 border-gray-200" />
            <IssueInfo issue={issue} className="mt-4" />
          </div>
        </div>
      </div>
    </div>
  );
};

IssueView.fragments = {
  IssueViewFragment: gql`
    fragment IssueViewFragment on Issue {
      id
      localId
      description
      createdAt
      email
      name
      status
      unread
      assignee {
        id
        name
        avatarUrl
      }
      issueActions {
        id
        category
        createdAt
        title
        body
        author {
          id
          name
          avatarUrl
        }
        ...IssueActionSupportNoteFragment
      }
      ...IssueTicketFragment
      ...IssueAssigneeFragment
      ...IssueInfoFragment
      ...IssueStatusInputFragment
    }
    ${IssueTicket.fragments.IssueTicketFragment}
    ${IssueAssignee.fragments.IssueAssigneeFragment}
    ${IssueActionSupportNote.fragments.IssueActionSupportNoteFragment}
    ${IssueInfo.fragments.IssueInfoFragment}
    ${IssueStatusInput.fragments.IssueStatusInputFragment}
  `,
};

export const GET_ISSUE_QUERY = gql`
  query GetIssue($id: Int!) {
    issue(id: $id) {
      id
      ...IssueViewFragment
    }
  }
  ${IssueView.fragments.IssueViewFragment}
`;

export const SEND_MESSAGE_MUTATION = gql`
  mutation IssueSendMessage($issueId: Int!, $input: IssueSendMessageInput!) {
    issueSendMessage(issueId: $issueId, input: $input) {
      id
      ...IssueViewFragment
    }
  }
  ${IssueView.fragments.IssueViewFragment}
`;

export const ADD_NOTE_MUTATION = gql`
  mutation IssueAddNote($issueId: Int!, $input: IssueAddNoteInput!) {
    issueAddNote(issueId: $issueId, input: $input) {
      id
      ...IssueViewFragment
    }
  }
  ${IssueView.fragments.IssueViewFragment}
`;

export const UPDATE_NOTE_MUTATION = gql`
  mutation IssueUpdateNote(
    $issueActionId: Int!
    $input: IssueUpdateNoteInput!
  ) {
    issueUpdateNote(issueActionId: $issueActionId, input: $input) {
      id
      ...IssueActionSupportNoteFragment
    }
  }
  ${IssueActionSupportNote.fragments.IssueActionSupportNoteFragment}
`;

export const DELETE_NOTE_MUTATION = gql`
  mutation IssueDeleteNote($issueActionId: Int!) {
    issueDeleteNote(issueActionId: $issueActionId) {
      id
      ...IssueViewFragment
    }
  }
  ${IssueView.fragments.IssueViewFragment}
`;

const MUTATE_UPDATE_ISSUE = gql`
  mutation UpdateIssueStatusForView($input: UpdateIssueInput!, $issueId: Int!) {
    updateIssue(input: $input, issueId: $issueId) {
      ...IssueViewFragment
    }
  }
  ${IssueView.fragments.IssueViewFragment}
`;

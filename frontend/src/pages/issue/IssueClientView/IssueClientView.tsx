import { useEffect, useState } from "react";
import { gql, useQuery } from "@apollo/client";
import { InboxInIcon } from "@heroicons/react/outline";
import { yupResolver } from "@hookform/resolvers/yup";
import { Label } from "components/fields/Label";
import { EmptyState } from "components/views/EmtpyState";
import { Panel, PanelBody, PanelHeader } from "components/views/Panel";
import { SmartTime } from "components/views/Time";
import { usePageTitle } from "hooks/usePageTitle";
import { FormProvider, useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import {
  Issue,
  IssueAction,
  IssueActionCategory,
  IssueStatus,
  MutationUpdateIssueByTokenArgs,
} from "types/graphql";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import * as yup from "yup";
import { FormTextareaGroup } from "components/fields/Textarea";
import { Button } from "components/fields/Button";
import { FCWithFragments } from "types";
import { useBlockingMutation } from "utils/graphql";
import { ConfirmModal } from "components/modals/ConfirmModal";
import { CheckIcon } from "@heroicons/react/solid";
import { IssueClientMessage } from "./IssueClientMessage";
import { IssueSupportMessage } from "./IssueSupportMessage";
import { getProofOfWork } from "pages/auth/Login/getProofOfWork";
import { IssueAutoResolved } from "./IssueAutoResolved";
import { UploadZone } from "components/fields/UploadZone";
import { IssueClientImage } from "./IssueClientImage";
import { IssueSupportImage } from "./IssueSupportImage";
import { UploadButton } from "components/fields/UploadButton";
import cn from "classnames";
import { QueryReturnValue } from "types/queryTypes";

interface IssueClientViewUrlParams {
  token: string;
}

const schema = yup
  .object()
  .noUnknown()
  .defined()
  .shape({
    message: yup.string().max(2048),
    imageUrl: yup.string().max(512),
  })
  .test(
    "has message or image url",
    "message or image url is required",
    (value) => !!(value.message || value.imageUrl)
  )
  .required();

type FormSchema = yup.InferType<typeof schema>;

export const IssueClientView: FCWithFragments = (props) => {
  const [isConfirmVisible, setConfirmVisible] = useState(false);
  const { token } = useParams<IssueClientViewUrlParams>();
  usePageTitle("Your Support Case");

  const formMethods = useForm<FormSchema>({ resolver: yupResolver(schema) });

  useEffect(() => (window as any).OrchaSupport.push(["hideButton"]), []);

  const { data, loading } = useQuery<QueryReturnValue["issueByToken"]>(
    GET_ISSUE_BY_TOKEN,
    {
      fetchPolicy: "cache-and-network", // Used for first execution
      nextFetchPolicy: "cache-first", // Used for subsequent executions
      variables: { token },
      onError: onGraphQLError({ title: "Could not retrieve issue" }),
    }
  );

  const [updateIssue] = useBlockingMutation<
    { updateTicketStage: Issue },
    MutationUpdateIssueByTokenArgs
  >(UPDATE_ISSUE_BY_TOKEN_MUTATION, {
    onError: onGraphQLError({ title: "Could not update ticket" }),
    onCompleted: onMutationComplete({ title: "Ticket has been updated" }),
  });

  const onSubmit = async (formData: FormSchema) => {
    const [proof, hash] = await getProofOfWork();

    updateIssue({
      variables: {
        token,
        input: {
          proof,
          hash,
          message: formData.message,
          imageUrl: formData.imageUrl,
        },
      },
      onCompleted: () => {
        formMethods.reset({ message: "", imageUrl: "" });
      },
    });
  };

  const onResolve = async () => {
    const [proof, hash] = await getProofOfWork();
    updateIssue({
      variables: {
        token,
        input: {
          proof,
          hash,
          status: IssueStatus.Resolved,
        },
      },
    });
  };

  if (loading) {
    return null;
  }

  if (!data) {
    return (
      <EmptyState
        title="Not Found"
        subTitle="Use the link on your support email to access your support case"
      />
    );
  }

  const issue = data.issueByToken;
  const { message, imageUrl } = formMethods.watch();
  const uploadButtonClass = cn(
    "mr-2 flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 font-title text-sm font-medium leading-5 shadow-sm transition duration-150 ease-in-out hover:text-gray-500 focus:outline-none focus:ring active:bg-gray-50 active:text-gray-800",
    {
      "pointer-events-none text-gray-300": message || imageUrl,
      "cursor-pointer text-gray-700": !message && !imageUrl,
    }
  );

  const renderMessageForm = () => (
    <div className="mt-6 border-t pt-6">
      <FormProvider {...formMethods}>
        <form onSubmit={formMethods.handleSubmit(onSubmit)}>
          <div>
            <Label htmlFor="issue-message" required>
              Message
            </Label>

            {imageUrl ? (
              <div className="relative">
                <img
                  src={imageUrl}
                  className="mt-1 h-36 w-full overflow-hidden rounded-lg object-cover"
                  alt="issue upload"
                />
                <div
                  onClick={() => formMethods.resetField("imageUrl")}
                  className="absolute inset-0 flex animate-pulse-once cursor-pointer items-center justify-center bg-white text-lg opacity-0 transition-all duration-200 hover:opacity-75"
                >
                  Click to remove image
                </div>
              </div>
            ) : (
              <UploadZone
                onUpload={() => null}
                name="imageUrl"
                className="mt-1 flex h-36 w-full flex-col"
                accept="image/*"
                info="PNG, JPG, GIF up to 10MB"
                isVisible={!!imageUrl}
                category="organization"
                disabled={!!message}
                issueToken={token}
              >
                <FormTextareaGroup
                  id="issue-message"
                  name="message"
                  required
                  rows={6}
                  placeholder="Type your message here or drop an image file..."
                />
              </UploadZone>
            )}
          </div>

          <div className="mt-4 flex justify-between">
            <Button
              type="button"
              btnType="white"
              onClick={() => setConfirmVisible(true)}
              disabled={formMethods.formState.isSubmitting}
            >
              Mark as Resolved
            </Button>
            <div className="flex items-center">
              <UploadButton
                onUpload={() => null}
                name="imageUrl"
                className={uploadButtonClass}
                accept="image/*"
                label="Upload image"
                category="organization"
                issueToken={token}
              />
              <Button
                type="submit"
                btnType="primary"
                disabled={formMethods.formState.isSubmitting}
              >
                Send message
              </Button>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );

  const renderIssueAction = (issueAction: IssueAction) => {
    switch (issueAction.category) {
      case IssueActionCategory.ClientMessage:
        return <IssueClientMessage issue={issue} issueAction={issueAction} />;
      case IssueActionCategory.ClientImage:
        return <IssueClientImage issue={issue} issueAction={issueAction} />;
      case IssueActionCategory.SupportMessage:
        return <IssueSupportMessage issue={issue} issueAction={issueAction} />;
      case IssueActionCategory.SupportImage:
        return <IssueSupportImage issue={issue} issueAction={issueAction} />;
      case IssueActionCategory.AutoResolved:
        return <IssueAutoResolved issue={issue} issueAction={issueAction} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gradient-to-tr from-gray-300 to-white py-4 px-2 sm:px-6 lg:px-8">
      <ConfirmModal
        cta="Yes, my issue has been resolved"
        title="Mark your issue as resolved?"
        description="Marking this issue as resolved will prevent you from sending any new messages and cannot be undone."
        onConfirm={onResolve}
        visible={isConfirmVisible}
        onClose={() => setConfirmVisible(false)}
      />
      <div className="flex flex-1 flex-col">
        <div className="flex flex-row justify-center">
          <div className="my-6 text-3xl font-light text-gray-600">
            Your Support Case
          </div>
        </div>
        <div className="mx-auto w-full max-w-4xl">
          <Panel>
            <PanelHeader>
              <h2 className="text-lg text-gray-800">
                <span className="text-gray-500">From: </span>
                <span className="font-medium">
                  {issue.name}
                  <span className="ml-2 hidden font-normal text-gray-700 sm:inline">
                    &lt;{issue.email}&gt;
                  </span>
                </span>
              </h2>
              <div className="mt-2 flex flex-col space-y-2 space-x-0 text-sm text-gray-500 md:flex-row md:space-x-6 md:space-y-0">
                <div>
                  Case ID:{" "}
                  <span className="font-semibold text-gray-700">
                    {issue.localId}
                  </span>
                </div>
                <div>
                  Created{" "}
                  <span className="font-semibold text-gray-700">
                    <SmartTime date={issue.createdAt} />
                  </span>
                </div>
                {issue.status === IssueStatus.Resolved && (
                  <span className="font-semibold text-green-600">
                    This issue has been resolved
                    <CheckIcon className="ml-1 inline h-4 w-4 align-text-bottom text-green-500" />
                  </span>
                )}
              </div>
            </PanelHeader>
            <PanelBody>
              <div className="flow-root">
                <ul className="-mb-8">
                  <li>
                    <div className="relative pb-8">
                      {issue.issueActions.length > 0 && (
                        <span
                          className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
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
                        <div className="min-w-0 flex-1 rounded-md bg-gray-100 px-4 py-2">
                          <div>
                            <div className="text-sm">
                              <span className="text-gray-900">
                                <span className="font-medium">
                                  me - {issue.name}
                                </span>
                                <span className="ml-2 hidden text-gray-700 sm:inline">
                                  &lt;{issue.email}&gt;
                                </span>
                              </span>
                            </div>
                            <p className="mt-0.5 text-sm text-gray-500">
                              <span className="mr-1 hidden sm:inline">
                                sent a support request
                              </span>
                              <SmartTime date={issue.createdAt} />
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
                            className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
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
              {issue.status === IssueStatus.Resolved
                ? null
                : renderMessageForm()}
            </PanelBody>
          </Panel>
        </div>
      </div>
    </div>
  );
};

IssueClientView.fragments = {
  IssueClientViewFragment: gql`
    fragment IssueClientViewFragment on Issue {
      id
      localId
      email
      name
      description
      createdAt
      status
      issueActions {
        id
        title
        body
        category
        createdAt
        author {
          id
          name
          avatarUrl
        }
      }
    }
  `,
};

const GET_ISSUE_BY_TOKEN = gql`
  query GetIssueByToken($token: String!) {
    issueByToken(token: $token) {
      id
      ...IssueClientViewFragment
    }
  }
  ${IssueClientView.fragments.IssueClientViewFragment}
`;

const UPDATE_ISSUE_BY_TOKEN_MUTATION = gql`
  mutation UpdateIssueByToken(
    $token: String!
    $input: ClientUpdateIssueInput!
  ) {
    updateIssueByToken(token: $token, input: $input) {
      id
      ...IssueClientViewFragment
    }
  }
  ${IssueClientView.fragments.IssueClientViewFragment}
`;

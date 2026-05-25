import React from "react";
import { MutationUpdateRoleAutoResumeArgs, Role } from "types/graphql";
import { useBlockingMutation } from "utils/graphql";
import { gql } from "@apollo/client";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { ToggleButton } from "components/fields/ToggleButton";
import { FCWithFragments } from "types";
import { format } from "date-fns";
import { ArrowCircleRightIcon } from "@heroicons/react/outline";
import { MutationReturnValue } from "types/queryTypes";
import { PopoverTips } from "components/help/HelpBlock";

interface Props {
  role: Role;
}

export const RoleAutoResumePreferenceForm: FCWithFragments<Props> = (props) => {
  const { role } = props;

  const [updateRoleAutoResume] = useBlockingMutation<
    MutationReturnValue["updateRoleAutoResume"],
    MutationUpdateRoleAutoResumeArgs
  >(UPDATE_ROLE_EMAIL_MUTATION, {
    onError: onGraphQLError({
      title: "Could not change auto resume",
    }),
    onCompleted: onMutationComplete({
      title: "Auto resume has been updated",
    }),
  });

  const isOptOut = role.roleAutoResume?.nextStartNotificationOptOut;

  const renderNextAttempt = () => (
    <div className="text-sm font-normal leading-6 text-gray-500">
      <span className="mr-1 hidden sm:inline">Next attempt</span>
      {format(new Date(role.roleAutoResume!.nextStartNotificationDate), "PPPPp")}
    </div>
  );

  const renderInformations = () => {
    if (!role.roleAutoResume?.nextStartNotificationDate || isOptOut) {
      return null;
    }
    return renderNextAttempt();
  };

  return (
    <div className="-mx-2 flex flex-col space-y-2">
      <div className="flex flex-row items-center space-x-2 py-4 px-2">
        <div className="mr-1 rounded-md bg-brand-50 p-1.5">
          <ArrowCircleRightIcon className="h-6 w-6 shrink-0 text-brand-600" />
        </div>
        <div className="flex-1 text-base font-medium text-gray-700">
          Auto resume tasks
          <PopoverTips
            title="Auto resume tasks"
            className="relative top-1 inline-block px-1"
          >
            <p>
              Orcha automatically pauses tasks at the end of your work
              period. When active, this feature will resume automatically paused
              tasks at the beginning of your next work period.
            </p>
            <p>This feature is active by default.</p>
          </PopoverTips>
          {renderInformations()}
        </div>
        <ToggleButton
          onChange={() =>
            updateRoleAutoResume({
              variables: {
                input: { nextStartNotificationOptOut: !isOptOut },
              },
            })
          }
          checked={!isOptOut}
        />
      </div>
    </div>
  );
};

RoleAutoResumePreferenceForm.fragments = {
  RoleAutoResumePreferenceFormFragment: gql`
    fragment RoleAutoResumePreferenceFormFragment on RoleAutoResume {
      id
      roleId
      nextStartNotificationOptOut
      nextStartNotificationDate
    }
  `,
};

const UPDATE_ROLE_EMAIL_MUTATION = gql`
  mutation UpdateRoleAutoResume($input: UpdateRoleAutoResumeInput!) {
    updateRoleAutoResume(input: $input) {
      id
      ...RoleAutoResumePreferenceFormFragment
    }
  }
  ${RoleAutoResumePreferenceForm.fragments.RoleAutoResumePreferenceFormFragment}
`;

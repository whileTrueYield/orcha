import React from "react";
import { MutationUpdateRoleEmailArgs, Role, RoleEmail } from "types/graphql";
import { useBlockingMutation } from "utils/graphql";
import { gql } from "@apollo/client";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { ToggleButton } from "components/fields/ToggleButton";
import { FCWithFragments } from "types";
import { format } from "date-fns";
import { MailIcon } from "@heroicons/react/outline";
import { PopoverTips } from "components/help/HelpBlock";

interface Props {
  role: Role & { roleEmail: RoleEmail };
}

export const RoleEmailPreferenceForm: FCWithFragments<Props> = (props) => {
  const { role } = props;

  const [updateRoleEmail] = useBlockingMutation<
    { updateRoleEmail: RoleEmail },
    MutationUpdateRoleEmailArgs
  >(UPDATE_ROLE_EMAIL_MUTATION, {
    onError: onGraphQLError({
      title: "Could not change your email preferences",
    }),
    onCompleted: onMutationComplete({
      title: "Your email preferences has been updated",
    }),
  });

  const isOptOut = role.roleEmail?.nextWorkDayNotificationOptOut;

  return (
    <div className="-mx-2 flex flex-col space-y-2">
      <div className="flex flex-row items-center space-x-2 py-4 px-2">
        <div className="mr-1 rounded-md bg-brand-50 p-1.5">
          <MailIcon className="h-6 w-6 shrink-0 text-brand-600" />
        </div>
        <div className="flex-1 text-base font-medium text-gray-700">
          Receive daily digest email
          <PopoverTips
            title="Daily digest email"
            className="relative top-1 inline-block px-1"
          >
            <p>
              Orcha can email you a digest ahead of your work day with a list
              of your unread notifications, tickets to estimate and more.
            </p>
            <p>This feature is active by default.</p>
          </PopoverTips>
          {role.roleEmail.nextWorkDayNotificationDate && !isOptOut ? (
            <div className="text-sm font-normal leading-6 text-gray-500">
              <span className="mr-1 hidden sm:inline">Next digest on</span>
              {format(
                new Date(role.roleEmail.nextWorkDayNotificationDate),
                "PPPPp"
              )}
            </div>
          ) : null}
        </div>
        <ToggleButton
          onChange={() =>
            updateRoleEmail({
              variables: {
                input: { nextWorkDayNotificationOptOut: !isOptOut },
              },
            })
          }
          checked={!isOptOut}
        />
      </div>
    </div>
  );
};

RoleEmailPreferenceForm.fragments = {
  roleEmailPreferenceFormFragment: gql`
    fragment roleEmailPreferenceFormFragment on RoleEmail {
      id
      roleId
      nextWorkDayNotificationOptOut
      nextWorkDayNotificationDate
    }
  `,
};

const UPDATE_ROLE_EMAIL_MUTATION = gql`
  mutation UpdateRoleEmail($input: UpdateRoleEmailInput!) {
    updateRoleEmail(input: $input) {
      id
      ...roleEmailPreferenceFormFragment
    }
  }
  ${RoleEmailPreferenceForm.fragments.roleEmailPreferenceFormFragment}
`;

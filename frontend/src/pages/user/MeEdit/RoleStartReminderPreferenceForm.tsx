import React from "react";
import {
  MutationUpdateRoleStartReminderArgs,
  Role,
  RoleStartReminder,
} from "types/graphql";
import { useBlockingMutation } from "utils/graphql";
import { gql } from "@apollo/client";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { ToggleButton } from "components/fields/ToggleButton";
import { FCWithFragments } from "types";
import { format } from "date-fns";
import { BellIcon } from "@heroicons/react/outline";
import { PopoverTips } from "components/help/HelpBlock";

interface Props {
  role: Role & { roleStartReminder: RoleStartReminder };
}

export const RoleStartReminderPreferenceForm: FCWithFragments<Props> = (
  props
) => {
  const { role } = props;

  const hasNotifications =
    "Notification" in window && Notification.permission === "granted";

  const [updateRoleStartReminder] = useBlockingMutation<
    { updateRoleStartReminder: RoleStartReminder },
    MutationUpdateRoleStartReminderArgs
  >(UPDATE_ROLE_EMAIL_MUTATION, {
    onError: onGraphQLError({
      title: "Could not change your reminder preferences",
    }),
    onCompleted: onMutationComplete({
      title: "Your reminder preferences has been updated",
    }),
  });

  const isOptOut = role.roleStartReminder?.nextStartNotificationOptOut;

  const renderNextReminder = () => (
    <div className="text-sm font-normal leading-6 text-gray-500">
      <span className="mr-1 hidden sm:inline">Next reminder on</span>
      {format(
        new Date(role.roleStartReminder.nextStartNotificationDate),
        "PPPPp"
      )}
    </div>
  );

  const renderNoNotifications = () => (
    <div className="flex flex-row items-center text-sm font-normal leading-6 text-red-500">
      Error: your browser notifications are disabled.
    </div>
  );

  const renderInformations = () => {
    if (!role.roleStartReminder.nextStartNotificationDate || isOptOut) {
      return null;
    }
    if (hasNotifications) {
      return renderNextReminder();
    } else {
      return renderNoNotifications();
    }
  };

  return (
    <div className="-mx-2 flex flex-col space-y-2">
      <div className="flex flex-row items-center space-x-2 py-4 px-2">
        <div className="mr-1 rounded-md bg-brand-50 p-1.5">
          <BellIcon className="h-6 w-6 shrink-0 text-brand-600" />
        </div>
        <div className="flex-1 text-base font-medium text-gray-700">
          Work check-in reminder
          <PopoverTips
            title="Work check-in reminder"
            className="relative top-1 inline-block px-1"
          >
            <p>
              Orcha can send you a desktop notification to remind you to
              start a task at the begining of your next work period.
            </p>
            <p>This feature is active by default.</p>
          </PopoverTips>
          {renderInformations()}
        </div>
        <ToggleButton
          onChange={() =>
            updateRoleStartReminder({
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

RoleStartReminderPreferenceForm.fragments = {
  roleStartReminderPreferenceFormFragment: gql`
    fragment roleStartReminderPreferenceFormFragment on RoleStartReminder {
      id
      roleId
      nextStartNotificationOptOut
      nextStartNotificationDate
    }
  `,
};

const UPDATE_ROLE_EMAIL_MUTATION = gql`
  mutation UpdateRoleStartReminder($input: UpdateRoleStartReminderInput!) {
    updateRoleStartReminder(input: $input) {
      id
      ...roleStartReminderPreferenceFormFragment
    }
  }
  ${RoleStartReminderPreferenceForm.fragments
    .roleStartReminderPreferenceFormFragment}
`;

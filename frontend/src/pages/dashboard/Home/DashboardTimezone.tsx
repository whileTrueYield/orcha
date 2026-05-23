import { gql } from "@apollo/client";
import { GlobeIcon } from "@heroicons/react/outline";
import { ExclamationIcon } from "@heroicons/react/solid";
import { ConfirmModal } from "components/modals/ConfirmModal";
import { last } from "lodash";
import React, { useState } from "react";
import { useAppDispatch } from "store";
import { MutationUpdateMyRoleArgs, Role } from "types/graphql";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { useBlockingMutation } from "utils/graphql";
import { TimezoneBanner } from "./TimezoneBanner";

interface Props {
  timeZone: string;
  className?: string;
}

export const DashboardTimezone: React.FC<Props> = (props) => {
  const [isConfirmVisible, setConfirmVisible] = useState(false);
  const dispatch = useAppDispatch();

  const { timeZone } = Intl.DateTimeFormat().resolvedOptions();
  const [isTzBannerVisible, setTzBannerVisible] = useState(
    timeZone !== props.timeZone
  );

  const timeZoneName = timeZone.replace("_", " ");
  const timeZoneShortName = last(timeZoneName.split("/"));

  const [updateMe] = useBlockingMutation<
    { updateMe: Role },
    MutationUpdateMyRoleArgs
  >(UPDATE_MY_ROLE_MUTATION, {
    onError: onGraphQLError({ title: "Could not update role" }),
    onCompleted: onMutationComplete({
      title: "Role has been updated",
      callback: ({ updateMe }) => {
        dispatch({ type: "SET_ME_ROLE", payload: updateMe });
      },
    }),
  });

  // are we in a different timeZone ?
  if (timeZone !== props.timeZone) {
    return (
      <div>
        <ConfirmModal
          title={`Update time zone to ${timeZoneShortName}?`}
          visible={isConfirmVisible}
          onClose={() => setConfirmVisible(false)}
          cta={`Yes, switch to ${timeZoneShortName}`}
          description="Your time zone seems to have changed. Updating your time zone will also update your work hours."
          onConfirm={() => updateMe({ variables: { input: { timeZone } } })}
          icon={<GlobeIcon className="h-6 w-6 text-brand-600" />}
        />
        {isTzBannerVisible && (
          <TimezoneBanner
            cta={`Switch to ${timeZoneShortName}`}
            onCancel={() => setTzBannerVisible(false)}
            onClick={() => setConfirmVisible(true)}
          />
        )}
        <div
          role="button"
          onClick={() => setConfirmVisible(true)}
          className="text-sm font-medium text-orange-600 hover:underline"
        >
          {props.timeZone.replace("_", " ")}
          <ExclamationIcon className="ml-1 inline h-4 w-4 text-orange-400" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="text-sm text-gray-500"
      title={`your current timezone is ${timeZoneName}`}
    >
      {timeZoneName}
    </div>
  );
};

const UPDATE_MY_ROLE_MUTATION = gql`
  mutation UpdateMyRoleTimeZoneForDashboard($input: UpdateMyRoleInput!) {
    updateMyRole(input: $input) {
      id
      timeZone
    }
  }
`;

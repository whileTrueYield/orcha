import React, { useState } from "react";
import { urlResolver } from "utils/navigation";
import { gql, useMutation } from "@apollo/client";
import { MutationUpdateOrganizationPreferencesArgs } from "types/graphql";
import cn from "classnames";
import { OnboardingStep } from "./OnboardingStep";
import { WarningConfirm } from "components/modals/WarningConfirm";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { getMe } from "reducers/selector";
import { useAppDispatch } from "store";
import { onMutationComplete } from "utils/GQLClient";
import { meOrganizationFragment } from "pages/auth/fragments";
import { MutationReturnValue } from "types/queryTypes";

interface Props {
  className?: string;
  onClose: () => void;
}

export const Onboarding: React.FC<Props> = (props) => {
  const { orgId } = useParams<{ orgId: string }>();
  const [showWarning, setShowWarning] = useState(false);
  const className = cn(
    "flex flex-col space-y-4 pl-4 pr-2 hidden xl:block",
    props.className
  );

  const me = useSelector(getMe);
  const dispatch = useAppDispatch();

  const [updateOrganizationPreferences] = useMutation<
    MutationReturnValue["updateOrganizationPreferences"],
    MutationUpdateOrganizationPreferencesArgs
  >(TOGGLE_ONBOARDING_MUTATION, {
    onCompleted: onMutationComplete({
      callback: ({ updateOrganizationPreferences: payload }) => {
        dispatch({ type: "SET_ME_ORGANIZATION", payload });
      },
    }),
  });

  if (!me?.organization) {
    return null;
  }

  const { organization } = me;

  return (
    <div className={className}>
      <WarningConfirm
        title="Exit Onboarding?"
        description="This action will remove the onboarding flow from the sidebar"
        cta="Exit Onboarding"
        visible={showWarning}
        onClose={() => setShowWarning(false)}
        onConfirm={() => {
          updateOrganizationPreferences({
            variables: { input: { showOnboarding: false } },
          });
        }}
      />
      <div className="space-y-2">
        <OnboardingStep
          position={1}
          title="Invite Others"
          description="Send invites to all your collaborators."
          to={urlResolver.role.listing(orgId, { create: "true" })}
          onClose={props.onClose}
          isDone={organization.onboardingStatus.invite}
        />
        <OnboardingStep
          position={2}
          title="First Product"
          description="Create your first product and associate it with a workflow."
          to={urlResolver.product.listing(orgId, { create: "true" })}
          onClose={props.onClose}
          isDone={organization.onboardingStatus.product}
        />
        <OnboardingStep
          position={3}
          onClose={props.onClose}
          title="Import Tickets"
          description="Create or Import tickets from other project management solutions."
          to={urlResolver.import.importTicket(orgId)}
          isDone={organization.onboardingStatus.ticket}
        />
      </div>
      <div className="flex flex-row justify-end">
        <button
          type="button"
          className="rounded-md border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm font-medium text-gray-300 shadow-sm transition hover:border-brand-900 hover:bg-brand-700 hover:text-white"
          onClick={() => setShowWarning(true)}
        >
          Exit Onboarding
        </button>
      </div>
    </div>
  );
};

const TOGGLE_ONBOARDING_MUTATION = gql`
  mutation ToggleOnboarding($input: UpdateOrganizationPreferencesInput!) {
    updateOrganizationPreferences(input: $input) {
      id
      ...meOrganizationFragment
    }
  }
  ${meOrganizationFragment}
`;

export const GET_ONBOARDING_STATUS_QUERY = gql`
  query OrganizationForOnboarding {
    organization {
      id
      ...meOrganizationFragment
    }
  }
  ${meOrganizationFragment}
`;

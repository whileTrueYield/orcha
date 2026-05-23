import React, { useState } from "react";
import { groupBy, map, partition } from "lodash";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client";
import {
  Role,
  RoleStatus,
  MutationAcceptRoleArgs,
  MutationRejectRoleArgs,
} from "types/graphql";
import { Link, Redirect, useHistory } from "react-router-dom";
import { urlResolver } from "utils/navigation";
import { Tag } from "components/tags/Tag";
import { Panel } from "components/views/Panel";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { Button } from "components/fields/Button";
import { Time } from "components/views/Time";
import { DangerConfirm } from "components/modals/DangerConfirm";
import { AuthScreenContainer } from "../Login/AuthScreenContainer";
import { plural } from "utils/string";
import { useBlockingMutation } from "utils/graphql";
import { usePageTitle } from "hooks/usePageTitle";
import { ErrorScreen } from "components/ErrorScreen";
import { QueryReturnValue } from "types/queryTypes";

const ACCEPT_ROLE_MUTATION = gql`
  mutation AcceptRole($input: AcceptRoleInput!) {
    acceptRole(input: $input) {
      id
      type
      status
      user {
        id
        email
      }
      organization {
        id
        name
        showOnboarding
      }
    }
  }
`;

const REJECT_ROLE_MUTATION = gql`
  mutation RejectRole($roleId: Int!) {
    rejectRole(roleId: $roleId) {
      id
      type
      status
      user {
        id
        email
      }
      organization {
        id
        name
      }
    }
  }
`;

const GET_MY_ROLES_QUERY = gql`
  query MyRolesForOrgSelect {
    myRoles {
      id
      title
      organization {
        id
        name
        showOnboarding
      }
      type
      status
      createdAt
    }
  }
`;

export const ChooseOrganization: React.FC = () => {
  const history = useHistory();
  const [isConfirmVisible, setIsConfirmModalVisible] = useState(false);
  const [roleIdToReject, setRoleIdToReject] = useState(0);

  usePageTitle("Select Organization");

  const { data, loading, error, refetch } = useQuery<
    QueryReturnValue["myRoles"]
  >(GET_MY_ROLES_QUERY, {
    onError: onGraphQLError({ title: "Could not retrieve your roles" }),
  });

  const [acceptRole] = useBlockingMutation<
    { acceptRole: Role },
    MutationAcceptRoleArgs
  >(ACCEPT_ROLE_MUTATION, {
    onCompleted: onMutationComplete({
      title: "Invitation Accepted",
      callback: ({ acceptRole }) =>
        history.push(
          urlResolver.onboarding.welcome(acceptRole.organization.id.toString())
        ),
    }),
    onError: onGraphQLError({
      title: "Invitation Failed",
    }),
  });

  const [rejectRole] = useBlockingMutation<
    { rejectRole: Role },
    MutationRejectRoleArgs
  >(REJECT_ROLE_MUTATION, {
    onCompleted: onMutationComplete({
      title: "Invitation Rejected",
      callback: () => refetch(),
    }),
    onError: onGraphQLError({
      title: "Invitation Rejection Failed",
    }),
  });

  if (loading) {
    return null;
  }

  if (!data) {
    return <ErrorScreen />;
  }

  if (error) {
    return <ErrorScreen />;
  }

  const rejectInvitation = (roleId: number) => {
    setRoleIdToReject(roleId);
    setIsConfirmModalVisible(true);
  };

  const myRoles = data.myRoles.filter(
    (role) =>
      role.status === RoleStatus.Invited || role.status === RoleStatus.Accepted
  );

  if (myRoles.length === 0) {
    return <Redirect to={urlResolver.auth.createFirstOrganization()} />;
  }

  const renderRoles = () => {
    if (roles.length === 0) {
      return (
        <div className="flex h-32 w-full flex-col items-center justify-center text-xl text-gray-500">
          You are not part of any organizations yet.
        </div>
      );
    }
    const groupedRoles = groupBy(roles, (role) => role.organization.name[0]);
    return (
      <nav
        className="mt-4 max-h-64 overflow-y-auto rounded-md shadow"
        aria-label="Directory"
      >
        {Object.keys(groupedRoles).map((letter) => (
          <div key={letter} className="relative">
            <div className="sticky top-0 z-10 border-t border-b border-gray-200 bg-gray-50 px-6 py-1 text-sm font-medium text-gray-500">
              <h3>{letter}</h3>
            </div>
            <ul className="relative z-0 divide-y divide-gray-200">
              {groupedRoles[letter].map((role) => (
                <li
                  key={role.id}
                  id={`organization-${role.organization.id}`}
                  className="cursor-pointer bg-white"
                >
                  <Link
                    to={urlResolver.dashboard.home(
                      role.organization.id.toString()
                    )}
                  >
                    <div className="relative flex items-center space-x-3 px-6 py-3 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 hover:bg-gray-50">
                      <div className="min-w-0 flex-1">
                        <div className="focus:outline-none">
                          {/* Extend touch target to entire panel */}
                          <span
                            className="absolute inset-0"
                            aria-hidden="true"
                          />
                          <p className="text-sm font-medium text-gray-900">
                            {role.organization.name}
                          </p>
                          <p className="mt-1 truncate text-sm text-gray-500">
                            <Tag
                              round
                              className="mr-2 bg-gray-100 text-gray-600"
                            >
                              {role.type}
                            </Tag>
                            {role.title}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    );
  };

  const renderInvites = () => {
    if (invites.length === 0) {
      return null;
    }

    const { timeZone } = Intl.DateTimeFormat().resolvedOptions();

    return (
      <div className="mt-6">
        <h3 className="text-lg text-gray-700">Pending Invites</h3>
        <Panel className="mt-2">
          <ul
            tabIndex={-1}
            role="listbox"
            aria-labelledby="listbox-label"
            aria-activedescendant="listbox-item-3"
            className="shadow-xs max-h-60 overflow-auto rounded-md py-1 text-base focus:outline-none sm:text-sm sm:leading-5"
          >
            {map(invites, (role) => (
              <li
                key={`listbox-option-${role.organization.id}`}
                className="relative flex select-none flex-col justify-between p-3 text-gray-900 md:flex-row"
              >
                <div className="flex flex-col justify-center truncate font-normal leading-6">
                  {role.organization.name}
                  <div className="text-sm text-gray-500">
                    Received on
                    <Time format=" MMMM d, yyy" date={role.createdAt} />
                  </div>
                </div>
                <div className="mt-2 flex items-center space-x-2 leading-6 md:mt-0">
                  <Button
                    onClick={() => rejectInvitation(role.id)}
                    btnSize="small"
                    type="button"
                    btnType="secondaryDanger"
                    className="md:flex-0 flex-1"
                  >
                    Decline
                  </Button>
                  <Button
                    className="md:flex-0 flex-1"
                    btnSize="small"
                    type="button"
                    btnType="primary"
                    onClick={() =>
                      acceptRole({
                        variables: {
                          input: {
                            roleId: role.id,
                            timeZone,
                          },
                        },
                      })
                    }
                  >
                    Accept Invitation
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    );
  };

  const [roles, invites] = partition(myRoles, { status: RoleStatus.Accepted });

  return (
    <AuthScreenContainer>
      <h2 className="mt-6 text-center text-3xl font-extrabold leading-9 text-gray-600">
        Select Organization
      </h2>
      <p className="mt-4 hidden px-4 text-center text-sm text-gray-500">
        These are the companies you are granted access to.
        {invites.length > 0
          ? ` You have ${plural(
              "{} pending invitation",
              "{} pending invitations",
              invites
            )} awaiting a response.`
          : " New invitations to join another company will appear here."}
      </p>

      <DangerConfirm
        cta="Yes, Decline"
        description="Once declined, you will not be able to be re-invited to this organization."
        onConfirm={() => rejectRole({ variables: { roleId: roleIdToReject } })}
        onClose={() => setIsConfirmModalVisible(false)}
        title={`Decline invitation?`}
        visible={isConfirmVisible}
      />
      <div className="mx-auto max-w-lg">
        {renderInvites()}
        {renderRoles()}
      </div>
      <p className="mt-4 px-4 text-center text-sm text-gray-500">
        You can also
        <Link
          to={urlResolver.auth.createOrganization()}
          className="mx-1 cursor-pointer text-brand-600 underline"
        >
          register an new company
        </Link>
        or
        <Link
          to={urlResolver.auth.logout()}
          className="ml-1 cursor-pointer text-brand-600 underline"
        >
          log out
        </Link>
        .
      </p>
    </AuthScreenContainer>
  );
};

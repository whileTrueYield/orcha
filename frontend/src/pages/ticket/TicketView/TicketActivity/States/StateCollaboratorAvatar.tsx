import { gql } from "@apollo/client";
import { Avatar } from "components/views/Avatar";
import { lowerCase } from "lodash";
import React from "react";
import { FCWithFragments } from "types";
import { Role, RoleStatus } from "types/graphql";

interface Props {
  role?: Role;
}

export const StateCollaboratorAvatar: FCWithFragments<Props> = (props) => {
  const { role } = props;

  if (!role) {
    return null;
  }

  const renderTitle = () => {
    if (role.status === RoleStatus.Accepted) {
      return (
        <div className="-mt-0.5 truncate text-xs leading-4">{role.title}</div>
      );
    } else if (role.status === RoleStatus.Deactivated) {
      return (
        <div className="-mt-0.5 leading-5">
          <span className="inline-block rounded border border-red-300 bg-red-50 px-1 py-px text-xs font-medium text-red-600">
            {lowerCase(role.status)}
          </span>
        </div>
      );
    } else {
      return (
        <div className="-mt-0.5">
          <span className="inline-block rounded border border-gray-300 bg-gray-50 px-1 py-px text-xs font-medium text-gray-600">
            {lowerCase(role.status)}
          </span>
        </div>
      );
    }
  };

  return (
    <div
      className="flex flex-row items-center justify-end"
      key={`role-${role.id}`}
    >
      <div className="flex flex-col items-end justify-center truncate">
        <div className="truncate text-base font-medium leading-6">
          {role.name}
        </div>
        {renderTitle()}
      </div>
      <Avatar
        src={role.avatarUrl}
        name={role.name}
        className="ml-2 h-10 w-10 shrink-0 rounded-md"
      />
    </div>
  );
};

StateCollaboratorAvatar.fragments = {
  StateCollaboratorAvatarFragment: gql`
    fragment StateCollaboratorAvatarFragment on Role {
      id
      name
      avatarUrl
      title
      status
    }
  `,
};

import React, { useState } from "react";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client";
import { Role } from "types/graphql";
import { ObjectSelectMany } from "components/fields/ObjectSelectMany";
import { get, map } from "lodash";
import { ObjectSelectSearch } from "components/fields/ObjectSelectSearch";
import { QueryReturnValue } from "types/queryTypes";

const GET_ROLES = gql`
  query GetRolesForRoleSelectMany($last: Int!, $search: String, $offset: Int) {
    roles(last: $last, search: $search, offset: $offset) {
      totalCount
      pageInfo {
        pageNumber
        hasNextPage
        hasPreviousPage
        pageSize
      }
      nodes {
        id
        title
        name
        avatarUrl
      }
    }
  }
`;

interface Props {
  label?: string;
  tabIndex?: number;
  value?: Role[];
  onChange: (value: Role[]) => void;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
}

export const RoleSelectMany: React.FC<Props> = (props) => {
  const [filter, setFilter] = useState("");

  const { data, error } = useQuery<QueryReturnValue["roles"]>(GET_ROLES, {
    variables: {
      last: 20,
      search: filter,
      offset: 0,
    },
  });

  if (error) {
    return null;
  }

  const roles = get(data, "roles.nodes", []);
  const roleCount = get(data, "roles.totalCount", 0);

  const searchHeader = () => {
    if (filter || roleCount > 4) {
      return <ObjectSelectSearch onChange={setFilter} />;
    }
  };

  return (
    <ObjectSelectMany<Role>
      className={props.className}
      tabIndex={props.tabIndex}
      label={props.label}
      header={searchHeader()}
      items={roles}
      value={props.value}
      onChange={props.onChange}
      identityMethod={(role) => (role ? role.id : null)}
      renderOptionLabel={(role) => (role ? role.name : "")}
      renderButtonLabel={(roles) => map(roles, "user.name").join(", ")}
      placeholder={props.placeholder ? props.placeholder : "Select one"}
      disabled={props.disabled}
    />
  );
};

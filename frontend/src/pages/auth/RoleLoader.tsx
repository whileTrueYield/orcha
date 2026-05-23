import { gql, useQuery } from "@apollo/client";
import React from "react";
import { useSelector } from "react-redux";
import { Redirect, useParams } from "react-router-dom";
import { getMe } from "reducers/selector";
import { useAppDispatch } from "store";
import { AuthStatus, QueryUseRoleArgs } from "types/graphql";
import { urlResolver } from "utils/navigation";
import { meFragment } from "./fragments";
import { QueryReturnValue } from "types/queryTypes";

const GET_ROLE_QUERY = gql`
  query RoleLoader($organizationId: Int!) {
    useRole(organizationId: $organizationId) {
      ...meFragment
    }
  }
  ${meFragment}
`;

type Props = {
  children?: React.ReactNode;
};

export const RoleLoader: React.FC<Props> = (props) => {
  const { orgId } = useParams<{ orgId: string }>();
  const dispatch = useAppDispatch();
  const me = useSelector(getMe);

  const { data, error, loading } = useQuery<
    QueryReturnValue["useRole"],
    QueryUseRoleArgs
  >(GET_ROLE_QUERY, {
    fetchPolicy: "cache-and-network",
    variables: { organizationId: parseInt(orgId) },
    onCompleted: ({ useRole }) =>
      dispatch({ type: "LOGIN_SUCCESS", payload: useRole }),
  });

  if (loading) {
    return null;
  }

  if (!data || error || !orgId || isNaN(parseInt(orgId))) {
    return <Redirect to={urlResolver.auth.chooseOrganization()} />;
  }

  if (me?.status === AuthStatus.Linked) {
    return <>{props.children}</>;
  }

  return null;
};

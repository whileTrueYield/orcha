import React, { useEffect } from "react";
import { useLazyQuery, gql, useMutation } from "@apollo/client";
import { useSelector } from "react-redux";
import { getAuthStatus } from "reducers/selector";
import { createNotification } from "actions";
import { useAppDispatch } from "store";
import { useHistory } from "react-router-dom";
import { GQLClient, onGraphQLError } from "utils/GQLClient";
import { urlResolver } from "utils/navigation";
import { meFragment } from "./fragments";
import { QueryReturnValue } from "types/queryTypes";

export const ME_QUERY = gql`
  query Me {
    me {
      ...meFragment
    }
  }
  ${meFragment}
`;

const LOGOUT = gql`
  mutation authLogout {
    logout
  }
`;

export const MeLoader: React.FC = () => {
  const history = useHistory();
  const authStatus = useSelector(getAuthStatus);
  const dispatch = useAppDispatch();
  const [getMe, { error }] = useLazyQuery<QueryReturnValue["me"]>(ME_QUERY, {
    fetchPolicy: "cache-and-network",
    onCompleted: (data) => {
      dispatch({ type: "SET_ME", payload: data.me });
      if (data.me.user) {
        (window as any).OrchaSupport.push(["setEmail", data.me.user.email]);
      }
      if (data.me.role) {
        (window as any).OrchaSupport.push(["setName", data.me.role.name]);
      }
    },
  });

  const [logout] = useMutation(LOGOUT, {
    onError: onGraphQLError({
      title: "Something when wrong",
      subTitle: "Try clearing your cookies",
    }),
    onCompleted: () => {
      GQLClient.clearStore().catch(() => {});
      dispatch({ type: "LOGOUT_SUCCESS" });
      history.replace(urlResolver.auth.login());
    },
  });

  useEffect(() => {
    if (authStatus === "unknown") {
      getMe();
    }
  }, [authStatus, getMe]);

  useEffect(() => {
    if (error) {
      dispatch(
        createNotification({
          type: "Error",
          title: "We couldn't authenticate you",
          subTitle: "Try login again",
          href: urlResolver.auth.login(),
        })
      );
      logout();
    }
  }, [error, dispatch, logout]);

  return null;
};

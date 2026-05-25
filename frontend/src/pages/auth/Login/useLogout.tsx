import { gql, useMutation } from "@apollo/client";
import { useHistory } from "react-router-dom";
import { useAppDispatch } from "store";
import { GQLClient, onGraphQLError } from "utils/GQLClient";
import { urlResolver } from "utils/navigation";

export const useLogout = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();

  return useMutation(LOGOUT, {
    onError: onGraphQLError({ title: "Could not log you out" }),
    onCompleted: () => {
      GQLClient.clearStore().catch(() => {});
      dispatch({ type: "LOGOUT_SUCCESS" });
      history.replace(urlResolver.auth.login());
    },
  });
};

const LOGOUT = gql`
  mutation logout {
    logout
  }
`;

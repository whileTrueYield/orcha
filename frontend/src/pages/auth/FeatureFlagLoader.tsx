import { gql, useQuery } from "@apollo/client";
import React from "react";
import { useAppDispatch } from "store";
import { QueryUseRoleArgs } from "types/graphql";
import { QueryReturnValue } from "types/queryTypes";

const GET_FEATURE_QUERY = gql`
  query FeatureFlagLoader {
    featureFlag {
      id
      documentation
      support
      report
      organizationId
    }
  }
`;

export const FeatureFlagLoader: React.FC = (props) => {
  const dispatch = useAppDispatch();

  useQuery<QueryReturnValue["featureFlag"], QueryUseRoleArgs>(
    GET_FEATURE_QUERY,
    {
      fetchPolicy: "cache-and-network",
      onError: () => console.warn("ERROR: unable to load feature flags"),
      onCompleted: ({ featureFlag }) =>
        dispatch({ type: "SET_FEATURE_FLAG", payload: featureFlag }),
    }
  );

  return null;
};

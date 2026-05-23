import { gql, useQuery } from "@apollo/client";
import { QueryReturnValue } from "types/queryTypes";

export const useMiniProjects = () => {
  const { data } = useQuery<QueryReturnValue["miniProjects"]>(
    GET_MINI_PROJECTS_QUERY,
    {
      fetchPolicy: "cache-and-network",
    }
  );

  return data?.miniProjects || [];
};

export const GET_MINI_PROJECTS_QUERY = gql`
  query GetMiniProjectsForName {
    miniProjects {
      id
      name
      parentId
    }
  }
`;

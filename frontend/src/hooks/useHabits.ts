import { gql, useQuery } from "@apollo/client";
import { RoleHabit } from "types/graphql";
import { QueryReturnValue } from "types/queryTypes";

export function useHabits(
  onCompleted?: (data: { habits: RoleHabit }) => void
): RoleHabit | null {
  const { data } = useQuery<QueryReturnValue["habits"]>(GET_ROLE_HABITS_QUERY, {
    fetchPolicy: "cache-and-network",
    onError: () => console.error("Could not retrieve role habits"),
    onCompleted,
  });

  return data?.habits || null;
}

const GET_ROLE_HABITS_QUERY = gql`
  query GetHabits {
    habits {
      projects {
        id
        name
      }
      productWorkflows {
        product {
          id
          name
          stage
          code
        }
        workflow {
          id
          stage
          name
        }
      }
    }
  }
`;

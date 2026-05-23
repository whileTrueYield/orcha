import { gql, useQuery } from "@apollo/client";
import { useSelector } from "react-redux";
import { getExplorerFilter } from "reducers/selector";
import { QueryMoreTicketsArgs } from "types/graphql";
import { QueryReturnValue } from "types/queryTypes";

export const useGetTicketForProject = (
  projectId: number,
  onCompleted?: (data: QueryReturnValue["moreTicketsForProject"]) => void
) => {
  const filter = useSelector(getExplorerFilter);

  const ticketQueryVariables: QueryMoreTicketsArgs = {
    projectId,
    sort: filter.sort.field,
    hideCompleted: filter.flags.hideCompleted.value,
  };

  if (filter.sort.direction === "ASC") {
    ticketQueryVariables.first = 50;
  } else {
    ticketQueryVariables.last = 50;
  }

  return useQuery<QueryReturnValue["moreTicketsForProject"]>(
    GET_TICKETS_QUERY_FOR_PROJECT,
    {
      variables: ticketQueryVariables,
      // when pulling previous pages, use cache
      nextFetchPolicy: "cache-first",
      // then use network only for the following pages
      fetchPolicy: "network-only",
      notifyOnNetworkStatusChange: true,
      onCompleted: onCompleted,
    }
  );
};

export const GET_TICKETS_QUERY_FOR_PROJECT = gql`
  query GetTicketsForProject(
    $first: Int
    $last: Int
    $cursor: Int
    $projectId: Int!
    $sort: String
    $hideCompleted: Boolean
  ) {
    moreTicketsForProject(
      first: $first
      last: $last
      cursor: $cursor
      projectId: $projectId
      sort: $sort
      hideCompleted: $hideCompleted
    ) {
      totalCount
      pageInfo {
        pageNumber
        hasNextPage
        hasPreviousPage
        pageSize
        endCursor
      }
      nodes {
        id
        localId
        organizationId
        createdAt
        eta
        closedAt
        stage
        status
        title
        workflow {
          id
          name
        }
        product {
          id
          code
        }
      }
    }
  }
`;

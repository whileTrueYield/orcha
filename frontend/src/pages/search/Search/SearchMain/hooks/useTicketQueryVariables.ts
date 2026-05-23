import { gql, useQuery } from "@apollo/client";
import { formatDateFilter } from "components/ListFilter/DateFilterTag";
import { map, trim, uniq } from "lodash";
import { useSelector } from "react-redux";
import { getSearchFilter } from "reducers/selector";
import {
  ModelStage,
  PaginatedTickets,
  QueryMoreTicketsArgs,
  TicketStatus,
} from "types/graphql";
import { QueryReturnValue } from "types/queryTypes";

export const useGetTicketForProject = (
  projectId?: number | null,
  onCompleted?: (data: { moreTickets: PaginatedTickets }) => void
) => {
  const filter = useSelector(getSearchFilter);

  const ticketQueryVariables: QueryMoreTicketsArgs = {
    projectId,
    recursive: true,
    sort: filter.sort.field,
    hideCompleted: filter.flags.hideCompleted.value,
    isReadyToSchedule: filter.flags.readyToSchedule.value,
  };

  if (filter.search && trim(filter.search)) {
    ticketQueryVariables.search = trim(filter.search);
  }

  if (filter.sort.direction === "ASC") {
    ticketQueryVariables.first = 50;
  } else {
    ticketQueryVariables.last = 50;
  }

  // workflows filtering
  if (filter.recordSets.workflows.length) {
    ticketQueryVariables.workflowIds = map(filter.recordSets.workflows, "id");
  }

  // product filtering
  if (filter.recordSets.products.length) {
    ticketQueryVariables.productIds = map(filter.recordSets.products, "id");
  }

  // author filter
  if (filter.recordSets.authors.length) {
    ticketQueryVariables.authorIds = map(filter.recordSets.authors, "id");
  }

  // owner filter
  if (filter.recordSets.owners.length) {
    ticketQueryVariables.ownerIds = map(filter.recordSets.owners, "id");
  }

  // assignees filter
  if (filter.recordSets.assignees.length) {
    ticketQueryVariables.assigneeIds = map(filter.recordSets.assignees, "id");
  }

  // tags filter
  if (filter.recordSets.tags.length) {
    ticketQueryVariables.tagIds = map(filter.recordSets.tags, "id");
  }

  // intersecting tags
  if (filter.recordSets.tags.length) {
    ticketQueryVariables.intersectTagIds = map(filter.recordSets.tags, "id");
    ticketQueryVariables.recursive = true;
  }

  if (filter.valueSets.statuses.length) {
    for (const status of filter.valueSets.statuses) {
      switch (status.value) {
        case ModelStage.Draft:
          ticketQueryVariables.stages = uniq([
            ...(ticketQueryVariables.stages || []),
            ModelStage.Draft,
          ]);
          break;
        case ModelStage.Published:
          ticketQueryVariables.stages = uniq([
            ...(ticketQueryVariables.stages || []),
            ModelStage.Published,
          ]);
          break;

        case ModelStage.Archived:
          ticketQueryVariables.stages = uniq([
            ...(ticketQueryVariables.stages || []),
            ModelStage.Archived,
          ]);
          break;

        case TicketStatus.Unscheduled:
          ticketQueryVariables.statuses = [
            ...(ticketQueryVariables.statuses || []),
            TicketStatus.Unscheduled,
          ];
          ticketQueryVariables.stages = uniq([
            ...(ticketQueryVariables.stages || []),
            ModelStage.Published,
          ]);
          break;
        case TicketStatus.Scheduled:
          ticketQueryVariables.statuses = [
            ...(ticketQueryVariables.statuses || []),
            TicketStatus.Scheduled,
          ];
          ticketQueryVariables.stages = uniq([
            ...(ticketQueryVariables.stages || []),
            ModelStage.Published,
          ]);
          break;
        case TicketStatus.Cancelled:
          ticketQueryVariables.statuses = [
            ...(ticketQueryVariables.statuses || []),
            TicketStatus.Cancelled,
          ];
          ticketQueryVariables.stages = uniq([
            ...(ticketQueryVariables.stages || []),
            ModelStage.Published,
          ]);
          break;
        case TicketStatus.Done:
          ticketQueryVariables.statuses = [
            ...(ticketQueryVariables.statuses || []),
            TicketStatus.Done,
          ];
          ticketQueryVariables.stages = uniq([
            ...(ticketQueryVariables.stages || []),
            ModelStage.Published,
          ]);
          break;
      }
    }
  }

  if (filter.dates.createdAt) {
    ticketQueryVariables.createdAtFilter = formatDateFilter(
      filter.dates.createdAt.afterDate,
      filter.dates.createdAt.beforeDate
    );
  }

  if (filter.dates.eta) {
    ticketQueryVariables.etaFilter = formatDateFilter(
      filter.dates.eta.afterDate,
      filter.dates.eta.beforeDate
    );
  }

  if (filter.dates.closedAt) {
    ticketQueryVariables.closedAtFilter = formatDateFilter(
      filter.dates.closedAt.afterDate,
      filter.dates.closedAt.beforeDate
    );
  }

  if (filter.flags.isActive.value) {
    ticketQueryVariables.isActive = true;
  }

  if (filter.flags.untagged.value) {
    ticketQueryVariables.untagged = true;
  }

  if (filter.flags.unassigned.value) {
    ticketQueryVariables.unassigned = true;
  }

  if (filter.flags.unestimated.value) {
    ticketQueryVariables.unestimated = true;
  }

  if (filter.allUntagged) {
    ticketQueryVariables.allUntagged = true;
  }

  if (filter.flags.atRisk.value) {
    ticketQueryVariables.atRisk = true;
  }

  return useQuery<QueryReturnValue["moreTickets"]>(
    GET_TICKETS_QUERY_FOR_SEARCH,
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

export const GET_TICKETS_QUERY_FOR_SEARCH = gql`
  query GetTicketsForSearch(
    $first: Int
    $last: Int
    $cursor: Int
    $search: String
    $projectId: Int
    $recursive: Boolean
    $sort: String
    $productId: Int
    $productIds: [Int!]
    $workflowIds: [Int!]
    $authorIds: [Int!]
    $ownerIds: [Int!]
    $assigneeIds: [Int!]
    $featureIds: [Int!]
    $tagIds: [Int!]
    $intersectTagIds: [Int!]
    $statuses: [TicketStatus!]
    $stages: [ModelStage!]
    $createdAtFilter: String
    $etaFilter: String
    $closedAtFilter: String
    $isActive: Boolean
    $isReadyToSchedule: Boolean
    $untagged: Boolean
    $unassigned: Boolean
    $unestimated: Boolean
    $allUntagged: Boolean
    $atRisk: Boolean
    $hideCompleted: Boolean
  ) {
    moreTickets(
      first: $first
      last: $last
      cursor: $cursor
      search: $search
      projectId: $projectId
      recursive: $recursive
      sort: $sort
      productId: $productId
      productIds: $productIds
      workflowIds: $workflowIds
      authorIds: $authorIds
      ownerIds: $ownerIds
      assigneeIds: $assigneeIds
      featureIds: $featureIds
      tagIds: $tagIds
      intersectTagIds: $intersectTagIds
      statuses: $statuses
      stages: $stages
      createdAtFilter: $createdAtFilter
      etaFilter: $etaFilter
      closedAtFilter: $closedAtFilter
      isActive: $isActive
      untagged: $untagged
      unassigned: $unassigned
      unestimated: $unestimated
      allUntagged: $allUntagged
      atRisk: $atRisk
      hideCompleted: $hideCompleted
      isReadyToSchedule: $isReadyToSchedule
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
        createdAt
        eta
        closedAt
        stage
        status
        title
        product {
          id
          code
        }
        workflow {
          id
          name
        }
        project {
          id
          name
          parentId
        }
      }
    }
  }
`;

import { gql, useQuery } from "@apollo/client";
import { TicketIcon } from "@heroicons/react/outline";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/solid";
import { EmptyState } from "components/views/EmtpyState";
import { Paginator } from "components/views/Paginator";
import { useLocalPagination } from "hooks/useLocalPagination";
import React, { useState } from "react";
import {
  ProjectTicketQueryCategory,
  QueryProjectTicketsForCategoryArgs,
  Ticket,
  QueryProjectAnalyticsArgs,
} from "types/graphql";
import { ProjectAnalyticTicketButton } from "./ProjectAnalyticTicketButton";
import { ProjectAnalyticTicketListRow } from "./ProjectAnalyticTicketListRow";
import cn from "classnames";
import { ListBox } from "components/fields/Listbox";
import { QueryReturnValue } from "types/queryTypes";

interface Props {
  projectId: number;
  onEditTicket: (ticketId: number) => void;
}

const PAGE_SIZE = 5;

export const ProjectAnalyticTicketButtons: React.FC<Props> = (props) => {
  const projectId = props.projectId;

  const [category, _setCategory] = useState<ProjectTicketQueryCategory>(
    ProjectTicketQueryCategory.Scheduled
  );
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal] = useState(0);

  const pagination = useLocalPagination({
    pageSize: PAGE_SIZE,
    sortDirection: "DESC",
  });
  const { setPage } = pagination;

  const setCategory = (newCategory: ProjectTicketQueryCategory) => {
    if (category !== newCategory) {
      _setCategory(newCategory);
      setPage(0);
    }
  };

  const ticketQueryVariables: QueryProjectTicketsForCategoryArgs = {
    projectId,
    category,
    sort: pagination.sortBy,
    offset: pagination.pageSize * pagination.page,
  };

  if (pagination.sortDirection === "ASC") {
    ticketQueryVariables.first = pagination.pageSize;
  } else {
    ticketQueryVariables.last = pagination.pageSize;
  }

  const { loading } = useQuery<
    QueryReturnValue["projectTicketsForCategory"],
    QueryProjectTicketsForCategoryArgs
  >(GET_PROJECTANALYTIC_TICKET_BY_CATEGORY_QUERY, {
    variables: ticketQueryVariables,
    fetchPolicy: "cache-and-network",
    onCompleted: ({ projectTicketsForCategory }) => {
      setTickets(projectTicketsForCategory.nodes);
      setTotal(projectTicketsForCategory.totalCount);
    },
  });

  const { data } = useQuery<
    QueryReturnValue["projectAnalytics"],
    QueryProjectAnalyticsArgs
  >(GET_PROJECT_ANALTYICS_QUERY, { variables: { projectId: projectId } });

  const loadingList = (
    <div className="col-span-6 flex h-[454px] items-center justify-center">
      <div className="flex h-64 w-full flex-col items-center justify-center">
        <TicketIcon className="h-12 w-12 text-gray-200" />
        <p className="mt-4 tracking-wide text-gray-400">Loading Tickets...</p>
      </div>
    </div>
  );

  const emptyList = (
    <div className="col-span-6 flex h-[454px] items-center justify-center">
      <EmptyState
        title={`${category} Tickets`}
        subTitle={`This category returned no tickets`}
      />
    </div>
  );

  const thClassText = `px-6 py-3 border-b border-gray-200 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap`;
  const thSortableClassText = `px-6 py-1 border-b border-gray-200 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap`;

  const sortableHeader = (title: string, key: string) => {
    const isSorted = pagination.sortBy === key;

    const buttonClass = cn(
      "inline-flex items-center group w-full text-left text-xs uppercase py-2",
      {
        "font-semibold text-gray-700": isSorted,
        "font-medium hover:text-gray-700": !isSorted,
      }
    );

    const showSortIcon = () => {
      if (pagination.sortDirection === "ASC") {
        return (
          <ChevronDownIcon className="ml-1 inline-block h-4 w-4 text-gray-700" />
        );
      } else {
        return (
          <ChevronUpIcon className="ml-1 inline-block h-4 w-4 text-gray-700" />
        );
      }
    };

    return (
      <button
        type="button"
        className={buttonClass}
        onClick={() => {
          pagination.setSortBy(key);

          if (isSorted) {
            pagination.setSortDirection(
              pagination.sortDirection === "ASC" ? "DESC" : "ASC"
            );
          } else {
            pagination.setSortDirection("DESC");
          }
        }}
      >
        {title}
        {isSorted ? (
          showSortIcon()
        ) : (
          <ChevronDownIcon className="ml-1 inline-block h-4 w-4 text-gray-500 opacity-0 transition-opacity group-hover:opacity-100" />
        )}
      </button>
    );
  };

  const ticketList = (
    <div className="flex flex-col ">
      <div className="-my-2 overflow-x-auto py-2 sm:-mx-4 sm:px-4">
        <div className="inline-block min-w-full overflow-hidden border-b border-gray-200 align-middle sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className={thSortableClassText}>
                  {sortableHeader("ID", "localId")}
                </th>
                <th className={thSortableClassText}>
                  {sortableHeader("Title", "title")}
                </th>
                <th className={thClassText}>Assignee</th>
                <th className={thClassText}>Status</th>
                <th className={thSortableClassText}>
                  {sortableHeader("Completion", "eta")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {tickets.map((ticket, index) => (
                <ProjectAnalyticTicketListRow
                  ticket={ticket}
                  onEditTicket={props.onEditTicket}
                  key={ticket.id}
                  index={index}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const categories = [
    ProjectTicketQueryCategory.Draft,
    ProjectTicketQueryCategory.Unassigned,
    ProjectTicketQueryCategory.Unestimated,
    ProjectTicketQueryCategory.Estimated,
    ProjectTicketQueryCategory.Scheduled,
    ProjectTicketQueryCategory.InProgress,
    ProjectTicketQueryCategory.Done,
  ];

  const projectAnalytics = data?.projectAnalytics;

  if (!projectAnalytics) {
    return null;
  }

  return (
    <div className="flex h-[600px] flex-col ">
      <div className="relative sm:hidden">
        <ListBox options={categories} value={category} onChange={setCategory} />
      </div>
      <div className="hidden grid-cols-7 divide-x overflow-hidden rounded-xl border sm:grid lg:grid-cols-7">
        <ProjectAnalyticTicketButton
          onClick={() => setCategory(ProjectTicketQueryCategory.Draft)}
          count={projectAnalytics.draftTicketCount}
          category={"gray"}
          active={category === ProjectTicketQueryCategory.Draft}
        >
          Draft
        </ProjectAnalyticTicketButton>

        <ProjectAnalyticTicketButton
          onClick={() => setCategory(ProjectTicketQueryCategory.Unassigned)}
          count={projectAnalytics.unassignedTicketCount}
          category={"warning"}
          active={category === ProjectTicketQueryCategory.Unassigned}
        >
          Assigning
        </ProjectAnalyticTicketButton>

        <ProjectAnalyticTicketButton
          onClick={() => setCategory(ProjectTicketQueryCategory.Unestimated)}
          count={projectAnalytics.unestimatedTicketCount}
          category={"warning"}
          active={category === ProjectTicketQueryCategory.Unestimated}
        >
          Estimating
        </ProjectAnalyticTicketButton>

        <ProjectAnalyticTicketButton
          onClick={() => setCategory(ProjectTicketQueryCategory.Estimated)}
          count={projectAnalytics.estimatedTicketCount}
          category={"ok"}
          active={category === ProjectTicketQueryCategory.Estimated}
        >
          Ready to Schedule
        </ProjectAnalyticTicketButton>

        <ProjectAnalyticTicketButton
          onClick={() => setCategory(ProjectTicketQueryCategory.Scheduled)}
          count={projectAnalytics.scheduledTicketCount}
          category={"info"}
          active={category === ProjectTicketQueryCategory.Scheduled}
        >
          Scheduled
        </ProjectAnalyticTicketButton>

        <ProjectAnalyticTicketButton
          onClick={() => setCategory(ProjectTicketQueryCategory.InProgress)}
          count={projectAnalytics.inProgressTicketCount}
          category={"info"}
          active={category === ProjectTicketQueryCategory.InProgress}
        >
          In Progress
        </ProjectAnalyticTicketButton>

        <ProjectAnalyticTicketButton
          onClick={() => setCategory(ProjectTicketQueryCategory.Done)}
          count={projectAnalytics.doneTicketCount}
          category={"danger"}
          active={category === ProjectTicketQueryCategory.Done}
        >
          <div className="-mt-2">Done</div>
        </ProjectAnalyticTicketButton>
      </div>
      <div className="mt-4">
        {tickets.length > 0 ? ticketList : loading ? loadingList : emptyList}
        <Paginator
          total={total}
          {...pagination}
          isLoading={loading}
          setPage={setPage}
          itemCount={tickets.length}
          itemName="ticket"
          className="mt-2 px-4 sm:px-0"
          edges
        />
      </div>
    </div>
  );
};

const GET_PROJECT_ANALTYICS_QUERY = gql`
  query ProjectAnalytics($projectId: Int!) {
    projectAnalytics(projectId: $projectId) {
      projectId
      organizationId
      scheduledTicketCount
      draftTicketCount
      inProgressTicketCount
      doneTicketCount
      unassignedTicketCount
      estimatedTicketCount
      unestimatedTicketCount
    }
  }
`;

const GET_PROJECTANALYTIC_TICKET_BY_CATEGORY_QUERY = gql`
  query ProjectAnalyticTicketsForCategory(
    $projectId: Int!
    $category: ProjectTicketQueryCategory!
    $first: Int
    $last: Int
    $sort: String
    $offset: Int
  ) {
    projectTicketsForCategory(
      projectId: $projectId
      category: $category
      first: $first
      last: $last
      sort: $sort
      offset: $offset
    ) {
      totalCount
      pageInfo {
        pageNumber
        hasNextPage
        hasPreviousPage
        pageSize
      }
      nodes {
        id
        ...ProjectAnalyticTicketListRowFragment
      }
    }
  }
  ${ProjectAnalyticTicketListRow.fragments.ProjectAnalyticTicketListRowFragment}
`;

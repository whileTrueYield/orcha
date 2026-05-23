import { gql, useLazyQuery, useQuery } from "@apollo/client";
import { SearchIcon } from "@heroicons/react/outline";
import { Button } from "components/fields/Button";
import { Paginator } from "components/views/Paginator";
import { useDebouncedState } from "hooks/useDebouncedState";
import { useLocalPagination } from "hooks/useLocalPagination";
import { difference, differenceBy, intersectionBy, map } from "lodash";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  MiniProduct,
  Tag,
  MiniWorkflow,
  QueryGetUnscheduledTicketsArgs,
  Ticket,
  MiniProject,
} from "types/graphql";

import { urlResolver } from "utils/navigation";
import { plural } from "utils/string";
import { ScheduledTicketList } from "./ScheduledTicketList";
import { ScheduleUnscheduledTicketList } from "./ScheduleUnscheduledTicketList";
import fuzzysort from "fuzzysort";
import { ProductSelect } from "components/fields/ProductSelect";
import { WorkflowSelect } from "components/fields/WorkflowSelect";
import { TagSelect } from "components/fields/TagSelect";
import { Label } from "components/fields/Label";
import { CheckboxGroup } from "components/fields/Checkbox";
import { useAppDispatch } from "store";
import { ProjectSelect } from "components/fields/ProjectSelect";
import {
  addTicketToSchedule,
  removeTicketFromSchedule,
  resetScheduleTickets,
  showTicketEditModal,
} from "actions";
import { useSelector } from "react-redux";
import {
  getAddedTicketsToSchedule,
  getRemovedTicketsFromSchedule,
} from "reducers/selector";
import {
  ChevronRightIcon,
  RefreshIcon,
  TrashIcon,
} from "@heroicons/react/solid";
import { usePageTitle } from "hooks/usePageTitle";
import { QueryReturnValue } from "types/queryTypes";
import { ScheduleDependenciesModal } from "./ScheduleDependenciesModal";
import { WarningConfirm } from "components/modals/WarningConfirm";

export const ScheduleTickets: React.FC = () => {
  const dispatch = useAppDispatch();
  usePageTitle("Schedule - Tickets");

  const { orgId } = useParams<{ orgId: string }>();
  const [scheduledTickets, setScheduledTickets] = useState<Ticket[]>([]);
  const [isResetConfirmVisible, setResetConfirmVisible] = useState(false);
  const [isConfirmClearVisible, setConfirmClearVisible] = useState(false);
  const [showAvailableTicketFilters, setShowAvailableTicketFilters] =
    useState(false);
  const [showScheduledTicketFilters, setShowScheduledTicketFilters] =
    useState(false);

  const [ticketToUnschedule, setTicketToUnschedule] = useState<Ticket | null>(
    null
  );

  const [unscheduledTicketCount, setUnscheduledTicketCount] = useState(0);
  const [unscheduledTickets, setUnscheduledTickets] = useState<Ticket[]>([]);
  const [scheduledTicketMatch, setScheduledTicketMatch] = useState<
    Ticket[] | null
  >(null);

  const addedTicketsToSchedule = useSelector(getAddedTicketsToSchedule);
  const removedTicketsFromSchedule = useSelector(getRemovedTicketsFromSchedule);

  const [addedTickets, setAddedTickets] = useState<Ticket[]>([]);
  const [removedTickets, setRemovedTickets] = useState<Ticket[]>([]);

  const [unscheduledDependencies, setUnscheduledDependencies] = useState<
    Ticket[]
  >([]);
  const [showUnscheduledDependencies, setShowUnscheduledDependencies] =
    useState(false);

  useEffect(() => {
    setAddedTickets(differenceBy(addedTicketsToSchedule, scheduledTickets));
  }, [addedTicketsToSchedule, scheduledTickets]);

  useEffect(() => {
    setRemovedTickets(
      intersectionBy(scheduledTickets, removedTicketsFromSchedule)
    );
  }, [removedTicketsFromSchedule, scheduledTickets]);

  const [includeIncomplete, setIncludeIncomplete] = useState(true);
  const [availableTicketProductFilter, setAvailableTicketProductFilter] =
    useState<MiniProduct | undefined>();
  const [availableTicketTagFilter, setAvailableTicketTagFilter] = useState<
    Tag | undefined
  >();
  const [availableTicketWorkflowFilter, setAvailableTicketWorkflowFilter] =
    useState<MiniWorkflow | undefined>();

  const [availableTicketProjectFilter, setAvailableTicketProjectFilter] =
    useState<MiniProject | undefined>();

  const [scheduledTicketProductFilter, setScheduledTicketProductFilter] =
    useState<MiniProduct | undefined>();

  const [scheduledTicketTagFilter, setScheduledTicketTagFilter] = useState<
    Tag | undefined
  >();
  const [scheduledTicketWorkflowFilter, setScheduledTicketWorkflowFilter] =
    useState<MiniWorkflow | undefined>();

  const [scheduledTicketProjectFilter, setScheduledTicketProjectFilter] =
    useState<MiniProject | undefined>();

  const { data: scheduledData, loading } = useQuery<
    QueryReturnValue["getScheduledTickets"]
  >(GET_SCHEDULED_TICKET_QUERY, {
    fetchPolicy: "cache-and-network",
    onCompleted: ({ getScheduledTickets }) => {
      setScheduledTickets(getScheduledTickets);
    },
  });

  const pagination = useLocalPagination({
    pageSize: 20,
    sortDirection: "ASC",
  });

  const { setPage } = pagination;
  const resetPage = useCallback(() => {
    setPage(0);
  }, [setPage]);

  const [
    debouncedAvailableSearch,
    debouncedSetAvailableSearch,
    availableSearch,
    setAvailableSearch,
  ] = useDebouncedState("", 500, resetPage);

  const [
    debouncedScheduleSearch,
    debouncedSetScheduleSearch,
    scheduleSearch,
    setScheduleSearch,
  ] = useDebouncedState("", 100);

  const unscheduledTicketQueryVariables: QueryGetUnscheduledTicketsArgs = {
    sort: pagination.sortBy,
    offset: pagination.pageSize * pagination.page,
    search: availableSearch,
    first: 10,
    productId: availableTicketProductFilter?.id,
    workflowId: availableTicketWorkflowFilter?.id,
    projectId: availableTicketProjectFilter?.id,
    tagId: availableTicketTagFilter?.id,
    isReadyToSchedule: !includeIncomplete,
  };

  if (pagination.sortDirection === "ASC") {
    unscheduledTicketQueryVariables.first = pagination.pageSize;
  } else {
    unscheduledTicketQueryVariables.last = pagination.pageSize;
  }

  useQuery<QueryReturnValue["getUnscheduledTickets"]>(
    GET_UNSCHEDULED_TICKET_QUERY,
    {
      fetchPolicy: "cache-and-network",
      variables: unscheduledTicketQueryVariables,
      onCompleted: ({ getUnscheduledTickets }) => {
        setUnscheduledTicketCount(getUnscheduledTickets.totalCount);
        setUnscheduledTickets(getUnscheduledTickets.nodes);
      },
    }
  );

  const [getAllUnscheduledDependencies] = useLazyQuery<
    QueryReturnValue["getAllUnscheduledDependencies"]
  >(GET_ALL_TICKET_DEPENDENCIES);

  useEffect(() => {
    if (!loading && scheduledData) {
      setScheduledTickets(scheduledData.getScheduledTickets);
    }
  }, [scheduledData, scheduledData?.getScheduledTickets, loading]);

  useEffect(() => {
    const removedTicketIds = map(removedTickets, "id");
    const scheduleTicketIds = [
      ...map(scheduledTickets, "id"),
      ...map(addedTickets, "id"),
    ];

    getAllUnscheduledDependencies({
      variables: { ticketIds: difference(scheduleTicketIds, removedTicketIds) },
      onCompleted: ({ getAllUnscheduledDependencies }) => {
        setUnscheduledDependencies(getAllUnscheduledDependencies);
      },
    });
  }, [
    scheduledTickets,
    addedTickets,
    removedTickets,
    getAllUnscheduledDependencies,
  ]);

  useEffect(() => {
    if (
      scheduleSearch ||
      scheduledTicketProductFilter ||
      scheduledTicketWorkflowFilter ||
      scheduledTicketTagFilter ||
      scheduledTicketProjectFilter
    ) {
      // filter ticket based on the product, tag or workflow filter
      const tickets = [...addedTickets, ...scheduledTickets].filter(
        (ticket) => {
          if (
            scheduledTicketProductFilter &&
            scheduledTicketProductFilter.id !== ticket.productId
          ) {
            return false;
          }

          if (
            scheduledTicketWorkflowFilter &&
            scheduledTicketWorkflowFilter.id !== ticket.workflowId
          ) {
            return false;
          }

          if (
            scheduledTicketProjectFilter &&
            scheduledTicketProjectFilter.id !== ticket.projectId
          ) {
            return false;
          }

          if (scheduledTicketTagFilter) {
            for (const tag of ticket.tags) {
              if (scheduledTicketTagFilter.id === tag.id) {
                return true;
              }
            }
            return false;
          }

          return true;
        }
      );

      if (scheduleSearch) {
        const results = fuzzysort.go(scheduleSearch, tickets, {
          keys: ["title", "description"],
          limit: 10,
          threshold: -Infinity,
        });
        setScheduledTicketMatch(map(results, "obj"));
      } else {
        setScheduledTicketMatch(tickets);
      }
    } else {
      setScheduledTicketMatch(null);
    }
  }, [
    scheduleSearch,
    setScheduledTicketMatch,
    addedTickets,
    scheduledTickets,
    scheduledTicketProductFilter,
    scheduledTicketWorkflowFilter,
    scheduledTicketTagFilter,
    scheduledTicketProjectFilter,
  ]);

  if (loading) {
    return null;
  }

  /**
   * when unscheduling a ticket that was added (but not committed) we should
   * check and inform the user if it breaks dependencies
   * @param ticket
   */
  const onUnscheduleTicket = (ticket: Ticket) => {
    dispatch(removeTicketFromSchedule(ticket));
  };

  /**
   * When scheduling a ticket, we'll first check if it has unscheduled dependencies
   * We'll also ignore dependencies already added to the schedule but not yet
   * committed.
   * @param ticket
   */
  const onScheduleTicket = (ticket: Ticket) => {
    dispatch(addTicketToSchedule(ticket));
  };

  const scrollToElement = (elementId: string) => () => {
    const container = document.getElementById(elementId);

    if (container) {
      container.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <div>
      <WarningConfirm
        title={`Undo Ticket Changes?`}
        visible={isResetConfirmVisible}
        onClose={() => setResetConfirmVisible(false)}
        cta={`Yes, undo changes`}
        description="Confirm you want to undo your changes to the schedule."
        onConfirm={() => dispatch(resetScheduleTickets())}
      />

      <WarningConfirm
        title="Dependency breakage detected"
        visible={!!ticketToUnschedule}
        onClose={() => setTicketToUnschedule(null)}
        cta={`Yes, unschedule ticket`}
        description="Confirm you want to unschedule this ticket. Unscheduling this ticket will break dependencies on other tickets you have scheduled"
        onConfirm={() =>
          ticketToUnschedule &&
          dispatch(removeTicketFromSchedule(ticketToUnschedule))
        }
      />

      <WarningConfirm
        title={`Clear Schedule?`}
        visible={isConfirmClearVisible}
        onClose={() => setConfirmClearVisible(false)}
        cta={`Yes, clear schedule`}
        description="Confirm you want to remove all scheduled tickets."
        onConfirm={() => {
          dispatch(resetScheduleTickets());
          scheduledTickets.map((ticket) =>
            dispatch(removeTicketFromSchedule(ticket))
          );
        }}
      />

      <ScheduleDependenciesModal
        visible={showUnscheduledDependencies}
        onClose={() => setShowUnscheduledDependencies(false)}
        dependencies={unscheduledDependencies}
        onAddDependencies={(tickets) => {
          tickets.map((ticket) => dispatch(addTicketToSchedule(ticket)));
          setShowUnscheduledDependencies(false);
        }}
      />

      <div className="flex flex-col space-y-6 lg:h-[calc(100vh-270px)] lg:min-h-[32rem] lg:flex-row lg:space-x-4 lg:space-y-0">
        <div className="flex shrink-0 flex-col px-2 lg:w-1/2 lg:px-0">
          <div className="mb-2 flex flex-row items-center justify-between px-2">
            <h2 className="text-xl font-medium text-gray-800">
              Available Tickets
            </h2>
            <span className="text-sm text-gray-500">
              {plural("{} ticket", "{} tickets", unscheduledTicketCount)}
            </span>
          </div>

          <div className="rounded-xl rounded-b-none border border-b-0 bg-gray-50 px-4 py-2 shadow-sm">
            <div className="mb-2">
              <Label
                htmlFor="available-search"
                className="mb-1"
                additionalInfo={
                  <button
                    type="button"
                    className="underline hover:text-gray-800 hover:no-underline"
                    onClick={() =>
                      setShowAvailableTicketFilters(!showAvailableTicketFilters)
                    }
                  >
                    {showAvailableTicketFilters ? "hide" : "show"} advanced
                    filters
                  </button>
                }
              >
                Filter
              </Label>
              <div className="relative">
                <SearchIcon className="absolute top-2 left-3 bottom-0 h-5 w-5 items-center text-gray-400" />
                <input
                  id="available-search"
                  onChange={(e) =>
                    debouncedSetAvailableSearch(e.currentTarget.value)
                  }
                  value={debouncedAvailableSearch}
                  type="text"
                  placeholder={`Search available tickets...`}
                  className="block w-full min-w-0 flex-1 rounded-md border-gray-300 pl-10 text-gray-800 shadow-sm transition duration-150 ease-in-out focus:border-brand-500 focus:ring focus:ring-brand-400 focus:ring-opacity-25 sm:text-sm"
                />
                {availableSearch && (
                  <div className="absolute right-2 top-0 bottom-0 flex items-center">
                    <button
                      onClick={() => setAvailableSearch("")}
                      className="focus:ring-blue rounded-md bg-gray-200 px-4 py-1 text-xs font-bold uppercase tracking-wide text-gray-500 transition-all duration-150 hover:bg-gray-300 hover:text-gray-500 focus:outline-none"
                    >
                      clear
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className={showAvailableTicketFilters ? "block" : "hidden"}>
              <div className="mb-4 hidden space-x-1 space-y-2 lg:mb-2 lg:flex lg:max-w-none lg:flex-row lg:space-y-0">
                <ProductSelect
                  onChange={(product) => {
                    setAvailableTicketProductFilter(product);
                    resetPage();
                  }}
                  placeholder="Product Filter"
                  value={availableTicketProductFilter}
                  onDelete={() => setAvailableTicketProductFilter(undefined)}
                />
                <WorkflowSelect
                  onChange={(workflow) => {
                    setAvailableTicketWorkflowFilter(workflow);
                    resetPage();
                  }}
                  placeholder="Workflow Filter"
                  value={availableTicketWorkflowFilter}
                  onDelete={() => setAvailableTicketWorkflowFilter(undefined)}
                />
                <TagSelect
                  onChange={(tag) => {
                    setAvailableTicketTagFilter(tag);
                    resetPage();
                  }}
                  value={availableTicketTagFilter}
                  placeholder="Tag Filter"
                  onDelete={() => setAvailableTicketTagFilter(undefined)}
                />
              </div>
              <div className="mb-2">
                <ProjectSelect
                  value={availableTicketProjectFilter}
                  onChange={(project) => {
                    setAvailableTicketProjectFilter(project);
                    resetPage();
                  }}
                  showUnsetButton
                />
              </div>

              <div className="mb-1">
                <CheckboxGroup
                  id="include-incomplete"
                  label="Include tickets with incomplete estimates"
                  defaultChecked={includeIncomplete}
                  onChange={(evt) => {
                    setIncludeIncomplete(evt.currentTarget.checked);
                    resetPage();
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto rounded-xl rounded-t-none border bg-white">
            <ScheduleUnscheduledTicketList
              onAddTicket={onScheduleTicket}
              onRemoveTicket={onUnscheduleTicket}
              onTicketDetail={(ticketId) =>
                dispatch(showTicketEditModal(ticketId))
              }
              tickets={unscheduledTickets}
              addedTickets={addedTickets}
            />
          </div>
          <Paginator
            total={unscheduledTicketCount}
            {...pagination}
            isLoading={loading}
            setPage={setPage}
            itemCount={unscheduledTickets.length}
            itemName="ticket"
            className="mt-4 px-4 sm:px-0"
            edges
          />
        </div>

        <div className="flex shrink-0 flex-col px-2 lg:w-1/2 lg:px-0">
          <div className="mb-2 flex flex-row items-center justify-between px-2">
            <h2 className="text-xl font-medium text-gray-800">Schedule</h2>
            <span className="text-sm text-gray-500">
              {plural(
                "{} ticket",
                "{} tickets",
                scheduledTickets.length -
                  removedTickets.length +
                  addedTickets.length
              )}
              <span className="text-xs">
                {addedTickets.length ? (
                  <button
                    className="ml-2 text-brand-700 hover:underline"
                    onClick={scrollToElement("added-tickets")}
                  >
                    +{addedTickets.length} added
                  </button>
                ) : null}
                {removedTickets.length ? (
                  <button
                    type="button"
                    onClick={scrollToElement("removed-tickets")}
                    className="ml-2 text-red-500 hover:underline"
                  >
                    -{removedTickets.length} removed
                  </button>
                ) : null}
              </span>
            </span>
          </div>
          <div className="rounded-xl rounded-b-none border border-b-0 bg-gray-50 px-4 py-2 shadow-sm">
            <div className="mb-2">
              <Label
                htmlFor="scheduled-search"
                className="mb-1"
                additionalInfo={
                  <button
                    type="button"
                    className="underline hover:text-gray-800 hover:no-underline"
                    onClick={() =>
                      setShowScheduledTicketFilters(!showScheduledTicketFilters)
                    }
                  >
                    {showScheduledTicketFilters ? "hide" : "show"} advanced
                    filters
                  </button>
                }
              >
                Filter
              </Label>
              <div className="relative">
                <SearchIcon className="absolute top-2 left-3 bottom-0 h-5 w-5 items-center text-gray-400" />
                <input
                  id="scheduled-search"
                  onChange={(e) =>
                    debouncedSetScheduleSearch(e.currentTarget.value)
                  }
                  value={debouncedScheduleSearch}
                  placeholder={`Search scheduled tickets...`}
                  type="text"
                  name="scheduled-search"
                  className="block w-full min-w-0 flex-1 rounded-md border-gray-300 pl-10 text-gray-800 shadow-sm transition duration-150 ease-in-out focus:border-brand-500 focus:ring focus:ring-brand-400 focus:ring-opacity-25 sm:text-sm"
                />
                {scheduleSearch && (
                  <div className="absolute right-2 top-0 bottom-0 flex items-center">
                    <button
                      onClick={() => setScheduleSearch("")}
                      className="focus:ring-blue rounded-md bg-gray-200 px-4 py-1 text-xs font-bold uppercase tracking-wide text-gray-500 transition-all duration-150 hover:bg-gray-300 hover:text-gray-500 focus:outline-none"
                    >
                      clear
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className={showScheduledTicketFilters ? "block" : "hidden"}>
              <div className="mb-4 hidden space-x-1 space-y-2 lg:mb-2 lg:flex lg:max-w-none lg:flex-row lg:space-y-0">
                <ProductSelect
                  onChange={setScheduledTicketProductFilter}
                  placeholder="Product Filter"
                  value={scheduledTicketProductFilter}
                  onDelete={() => setScheduledTicketProductFilter(undefined)}
                />
                <WorkflowSelect
                  onChange={(workflow) => {
                    setScheduledTicketWorkflowFilter(workflow);
                    resetPage();
                  }}
                  placeholder="Workflow Filter"
                  value={scheduledTicketWorkflowFilter}
                  onDelete={() => setScheduledTicketWorkflowFilter(undefined)}
                />
                <TagSelect
                  onChange={setScheduledTicketTagFilter}
                  value={scheduledTicketTagFilter}
                  placeholder="Tag Filter"
                  onDelete={() => setScheduledTicketTagFilter(undefined)}
                />
              </div>
              <div className="mb-1">
                <ProjectSelect
                  value={scheduledTicketProjectFilter}
                  onChange={setScheduledTicketProjectFilter}
                  showUnsetButton
                />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto rounded-xl rounded-t-none border bg-white">
            {unscheduledDependencies.length > 0 && (
              <button
                type="button"
                onClick={() => setShowUnscheduledDependencies(true)}
                className="sticky top-0 w-full bg-orange-50 p-4 text-sm font-medium text-orange-600 hover:bg-orange-100"
              >
                Unscheduled dependencies detected.
              </button>
            )}
            <ScheduledTicketList
              onAddTicket={onScheduleTicket}
              onRemoveTicket={onUnscheduleTicket}
              onTicketDetail={(ticketId) =>
                dispatch(showTicketEditModal(ticketId))
              }
              tickets={
                scheduledTicketMatch
                  ? intersectionBy(scheduledTicketMatch, scheduledTickets, "id")
                  : scheduledTickets
              }
              addedTickets={
                scheduledTicketMatch
                  ? intersectionBy(scheduledTicketMatch, addedTickets, "id")
                  : addedTickets
              }
              removedTickets={removedTickets}
            />
          </div>
        </div>
      </div>
      <div className="mt-4 hidden flex-row justify-between border-t pt-4 md:flex">
        <div className="flex flex-row space-x-2">
          <Button
            onClick={() => setResetConfirmVisible(true)}
            type="button"
            btnType="warning"
            disabled={addedTickets.length + removedTickets.length === 0}
          >
            <RefreshIcon className="mr-1 -ml-0.5 h-4 w-4" />
            Undo Ticket Changes
          </Button>
          <Button
            onClick={() => setConfirmClearVisible(true)}
            type="button"
            btnType="warning"
          >
            <TrashIcon className="mr-1 -ml-0.5 h-4 w-4" />
            Clear Schedule
          </Button>
        </div>
        <div className="flex flex-row space-x-1">
          <Button
            asElement={(className) => (
              <Link to={urlResolver.schedule.root(orgId)} className={className}>
                Cancel
              </Link>
            )}
            type="button"
            btnType="secondaryWhite"
            fullInMobile
          />

          <Button
            fullInMobile
            type="button"
            btnType="white"
            asElement={(className) => (
              <Link
                className={className}
                to={urlResolver.schedule.editPriorities(orgId)}
              >
                Priorities
                <ChevronRightIcon className="ml-1 -mr-0.5 h-4 w-4" />
              </Link>
            )}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-col space-y-2 px-2 md:hidden">
        <Button
          onClick={() => setResetConfirmVisible(true)}
          type="button"
          btnType="warning"
          fullInMobile
          disabled={addedTickets.length + removedTickets.length === 0}
        >
          <RefreshIcon className="mr-1 -ml-0.5 h-4 w-4" />
          Undo Ticket Changes
        </Button>

        <Button
          fullInMobile
          type="button"
          btnType="white"
          asElement={(className) => (
            <Link
              className={className}
              to={urlResolver.schedule.editPriorities(orgId)}
            >
              Priorities
              <ChevronRightIcon className="ml-1 -mr-0.5 h-4 w-4" />
            </Link>
          )}
        />
      </div>
    </div>
  );
};

const GET_SCHEDULED_TICKET_QUERY = gql`
  query getScheduledTickets {
    getScheduledTickets {
      id
      title
      createdAt
      updatedAt
      description
      workflowId
      productId
      projectId
      milestone

      tags {
        id
      }
      project {
        id
        name
        parentId
      }
      ...ScheduledTicketListFragment
      ...ScheduleUnscheduledTicketListFragment
    }
  }

  ${ScheduleUnscheduledTicketList.fragments
    .ScheduleUnscheduledTicketListFragment}
  ${ScheduledTicketList.fragments.ScheduledTicketListFragment}
`;

const GET_UNSCHEDULED_TICKET_QUERY = gql`
  query getUnscheduledTickets(
    $first: Int
    $last: Int
    $search: String
    $sort: String
    $offset: Int
    $tagId: Int
    $productId: Int
    $workflowId: Int
    $projectId: Int
    $isReadyToSchedule: Boolean
  ) {
    getUnscheduledTickets(
      first: $first
      last: $last
      search: $search
      projectId: $projectId
      sort: $sort
      offset: $offset
      tagId: $tagId
      productId: $productId
      workflowId: $workflowId
      isReadyToSchedule: $isReadyToSchedule
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
        title
        projectId
        createdAt
        updatedAt
        description
        milestone
        ...ScheduledTicketListFragment
        ...ScheduleUnscheduledTicketListFragment
      }
    }
  }
  ${ScheduleUnscheduledTicketList.fragments
    .ScheduleUnscheduledTicketListFragment}
  ${ScheduledTicketList.fragments.ScheduledTicketListFragment}
`;

const GET_ALL_TICKET_DEPENDENCIES = gql`
  query GetAllUnscheduledDependenciesForScheduler($ticketIds: [Int!]!) {
    getAllUnscheduledDependencies(ticketIds: $ticketIds) {
      id
      ...ScheduleDependenciesModalFragment
    }
  }
  ${ScheduleDependenciesModal.fragments.ScheduleDependenciesModalFragment}
`;

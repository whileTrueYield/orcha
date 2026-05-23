import { gql, useLazyQuery, useQuery } from "@apollo/client";
import { Button } from "components/fields/Button";
import { Tag } from "components/tags/Tag";
import { LoadingState } from "components/views/LoadingState";
import { differenceInDays, format } from "date-fns";
import { usePageTitle } from "hooks/usePageTitle";
import {
  filter,
  find,
  intersectionBy,
  keyBy,
  map,
  orderBy,
  uniq,
} from "lodash";
import { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useHistory, useParams } from "react-router-dom";
import {
  getAddedTicketsToSchedule,
  getSchedulePriorities,
  getScheduleProjections,
  getScheduleProjectionSorting,
  getRemovedTicketsFromSchedule,
  scheduleProjectionsRequireRefresh,
} from "reducers/selector";
import {
  FCWithFragments,
  ScheduleConfigs,
  ScheduleTicketColumns,
  ScheduleTicketRow,
  RecordFilterElement,
} from "types";
import {
  MutationCommitScheduleChangesArgs,
  QueryPlanningProjectionArgs,
  ScheduleConfig,
  ScheduleConfigForEstimateInput,
  Ticket,
} from "types/graphql";
import { urlResolver } from "utils/navigation";
import { plural } from "utils/string";
import cn from "classnames";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronUpIcon,
  RefreshIcon,
} from "@heroicons/react/solid";
import { ConfirmModal } from "components/modals/ConfirmModal";
import { CalendarIcon } from "@heroicons/react/outline";
import { useBlockingMutation } from "utils/graphql";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { useAppDispatch } from "store";
import { resetSchedule, showTicketEditModal } from "actions";
import { WarningConfirm } from "components/modals/WarningConfirm";
import {
  setScheduleProjections,
  setScheduleProjectionSorting,
} from "actions/schedule/scheduleProjections";
import { TicketIdTag } from "components/tags/TicketIdTag";
import { QueryReturnValue } from "types/queryTypes";

export const ScheduleProjections: FCWithFragments = () => {
  usePageTitle("Schedule - Projections");
  const { orgId } = useParams<{ orgId: string }>();
  const dispatch = useAppDispatch();
  const history = useHistory();

  const [currentScheduleConfigs, setCurrentScheduleConfigs] = useState<
    ScheduleConfigs[]
  >([]);
  const [isConfirmResetVisible, setConfirmResetVisible] = useState(false);
  const [isConfirmCommitVisible, setConfirmCommitVisible] = useState(false);
  const addedTickets = useSelector(getAddedTicketsToSchedule);
  const removedTickets = useSelector(getRemovedTicketsFromSchedule);
  const scheduleConfigs = useSelector(getSchedulePriorities);
  const [scheduledTickets, setScheduledTickets] = useState<Ticket[]>([]);

  const projections = useSelector(getScheduleProjections);
  const requiresRefresh = useSelector(scheduleProjectionsRequireRefresh);
  const { sort, direction } = useSelector(getScheduleProjectionSorting);

  const { error, loading } = useQuery<QueryReturnValue["getScheduledTickets"]>(
    GET_SCHEDULED_TICKET_QUERY,
    {
      fetchPolicy: "cache-and-network",
      onCompleted: ({ getScheduledTickets }) => {
        setScheduledTickets(getScheduledTickets);
      },
    }
  );

  useQuery<QueryReturnValue["scheduleConfigs"]>(GET_SCHEDULE_CONFIG_QUERY, {
    fetchPolicy: "cache-and-network",
    onError: onGraphQLError({ title: "Could not retrieve priority filters" }),
    onCompleted: ({ scheduleConfigs }) => {
      const sortedConfigs: ScheduleConfig[] = orderBy(
        scheduleConfigs,
        "priority"
      );

      setCurrentScheduleConfigs(
        sortedConfigs.map(
          ({ products, workflows, tickets, tags, id, projects }) => ({
            id,
            filter: {
              recordSets: {
                projects: projects.map((e) => ({ id: e.id, label: e.name })),
                products: products.map((e) => ({ id: e.id, label: e.name })),
                workflows: workflows.map((e) => ({ id: e.id, label: e.name })),
                tickets: tickets.map((e) => ({
                  id: e.id,
                  label: e.title,
                })),
                tags: tags.map((e) => ({ id: e.id, label: e.name })),
              },
              dates: {},
              flags: {},
              valueSets: {},
            },
          })
        )
      );
    },
  });

  const [getProjections, { loading: projectionLoading }] = useLazyQuery<
    QueryReturnValue["planningProjection"],
    QueryPlanningProjectionArgs
  >(GET_SCHEDULE_PROJECTION_QUERY, {
    fetchPolicy: "network-only",
    onCompleted: ({ planningProjection }) => {
      const scheduledTicketByIds = keyBy(scheduledTickets, "id");
      dispatch(
        setScheduleProjections([
          ...map(planningProjection, (ticket): ScheduleTicketRow => {
            const row: ScheduleTicketRow = {
              id: ticket.id,
              title: ticket.title,
              localId: ticket.localId,
              productCode: ticket.productCode,
              workflowName: ticket.workflowName,
              milestone: ticket.milestone,
              isRemoved: false,
              isNew: false,
              newEta: new Date(ticket.eta),
              currentEta: null,
              status: "kept",
              delta: 0,
            };

            const scheduledTicket = scheduledTicketByIds[ticket.id];
            // sometimes a scheduled ticket does not have an ETA yet, since
            // wait up to a minute before running the scheduler. This can cause
            // odd situation where the ticket:
            // IS scheduled but DOES NOT have an eta info.
            // in this case, the ticket will also be marked as new
            if (scheduledTicket && scheduledTicket.eta) {
              row.currentEta = new Date(scheduledTicket.eta);
              row.delta = differenceInDays(row.newEta!, row.currentEta);
            } else {
              row.isNew = true;
              row.status = "added";
            }

            return row;
          }),
          ...map(
            intersectionBy(scheduledTickets, removedTickets, "id"),
            (ticket): ScheduleTicketRow => {
              return {
                id: ticket.id,
                title: ticket.title,
                status: "removed",
                localId: ticket.localId!,
                milestone: ticket.milestone,
                productCode: ticket.product?.code || "n/a",
                workflowName: ticket.workflow?.name || "n/a",
                isRemoved: true,
                isNew: false,
                newEta: null,
                currentEta: new Date(scheduledTicketByIds[ticket.id].eta),
                delta: 0,
              };
            }
          ),
        ])
      );
    },
  });

  const [commitScheduleChanges] = useBlockingMutation<
    { commitScheduleChanges: boolean },
    MutationCommitScheduleChangesArgs
  >(MUTATE_COMMIT_SCHEDULE_CHANGES, {
    onError: onGraphQLError({ title: "Could not commit schedule changes" }),
    onCompleted: onMutationComplete({
      title: "Schedule changes committed",
      callback: () => {
        dispatch(resetSchedule());
        history.push(urlResolver.schedule.root(orgId));
      },
    }),
  });

  const onLoadProjection = useCallback(async () => {
    const keptTickets = filter(
      scheduledTickets,
      (ticket) => !find(removedTickets, { id: ticket.id })
    );

    // converty a filter information into a proper schedule config input
    const toEstimateObj = (filter: RecordFilterElement[]) =>
      map(filter, ({ id }) => ({ id }));

    // flush preview predictions
    dispatch(setScheduleProjections(null));

    await getProjections({
      variables: {
        scheduleConfigs: map(
          scheduleConfigs || currentScheduleConfigs,
          ({ filter }, index): ScheduleConfigForEstimateInput => ({
            priority: index + 1,
            features: [],
            projects: toEstimateObj(filter.recordSets.projects),
            products: toEstimateObj(filter.recordSets.products),
            workflows: toEstimateObj(filter.recordSets.workflows),
            tags: toEstimateObj(filter.recordSets.tags),
            tickets: toEstimateObj(filter.recordSets.tickets),
          })
        ),
        ticketIds: uniq(map([...keptTickets, ...addedTickets], "id")),
      },
    });
  }, [
    removedTickets,
    addedTickets,
    scheduleConfigs,
    currentScheduleConfigs,
    dispatch,
    getProjections,
    scheduledTickets,
  ]);

  // useEffect(() => {
  //   if (!projections && !projectionLoading && !loadingScheduledTickets) {
  //     onLoadProjection();
  //   }
  // }, [
  //   projections,
  //   projectionLoading,
  //   onLoadProjection,
  //   loadingScheduledTickets,
  // ]);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    console.error(error);
    return (
      <div className="p-12 text-center text-xl text-red-600">
        Something wrong happened!
      </div>
    );
  }

  if (projectionLoading) {
    return (
      <LoadingState
        title="Generating Simulation"
        subTitle="This can take up to 30 seconds..."
      />
    );
  }

  if (!projections) {
    return (
      <div className="flex w-full flex-col items-center justify-center py-8">
        <img
          src="/img/svg/undraw_schedule_re_2vro.svg"
          className="max-w-xs px-4"
          alt="Man with a cap looking into an empty box"
        />

        <div className="text-semibold mt-8 text-xl text-gray-700">
          Ready to see your new schedule?
        </div>
        <span className="mt-2 text-base text-gray-500">
          click below to compute the projections based on your plan
        </span>
        <div className="mt-6">
          <Button
            onClick={onLoadProjection}
            type="button"
            btnSize="large"
            btnType="primary"
          >
            Generate Predictions
          </Button>
        </div>
      </div>
    );
  }

  const sortedRows =
    sort === "delta"
      ? orderBy(projections, ["status", "delta"], [direction, direction])
      : orderBy(projections, sort, direction);

  const renderDelta = (ticket: ScheduleTicketRow) => {
    if (ticket.currentEta && ticket.newEta) {
      const delta = differenceInDays(ticket.newEta, ticket.currentEta);
      if (delta > 0) {
        return (
          <span className="rounded-md bg-red-50 px-2 py-0.5 font-medium text-red-700">
            {plural("{} day", "{} days", delta)} later
          </span>
        );
      } else if (delta < 0) {
        return (
          <span className="rounded-md bg-green-50 px-2 py-0.5 font-medium text-green-700">
            {plural("{} day", "{} days", -1 * delta)} earlier
          </span>
        );
      }
    }

    return null;
  };

  const renderStatus = ({ isNew, isRemoved }: ScheduleTicketRow) => {
    if (isNew) {
      return (
        <Tag className="bg-brand-100 font-medium text-brand-800">ADDED</Tag>
      );
    } else if (isRemoved) {
      return <Tag className="bg-red-100 font-medium text-red-800">REMOVED</Tag>;
    }

    return null;
  };

  const renderProjectionRow = (ticket: ScheduleTicketRow) => {
    return (
      <tr
        key={ticket.id}
        className={cn({
          "bg-red-50": ticket.isRemoved,
          "bg-brand-50": ticket.isNew,
          "bg-yellow-50": ticket.milestone,
        })}
      >
        <td
          title={ticket.title}
          className="max-w-md truncate whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-800 sm:pl-6"
        >
          <TicketIdTag
            milestone={ticket.milestone}
            className="mr-1 text-xs"
            localId={ticket.localId}
            productCode={ticket.productCode}
          />

          <button
            onClick={() => dispatch(showTicketEditModal(ticket.id))}
            className="truncate text-gray-700 hover:text-brand-700 hover:underline"
            type="button"
          >
            {ticket.title}
          </button>
        </td>
        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
          {ticket.workflowName}
        </td>
        {/* <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
          {renderStatus(ticket)}
        </td> */}
        {/* <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
          {ticket.currentEta ? format(ticket.currentEta, "ccc PP") : ""}
        </td> */}
        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
          {ticket.newEta ? format(ticket.newEta, "ccc PP") : ""}
        </td>
        <td className="whitespace-nowrap px-3 py-4 text-left text-sm text-gray-500">
          {renderDelta(ticket)}
          {renderStatus(ticket)}
        </td>
      </tr>
    );
  };

  const setSorting = (_sort: ScheduleTicketColumns) => () => {
    if (_sort === sort) {
      dispatch(
        setScheduleProjectionSorting({
          sort,
          direction: direction === "asc" ? "desc" : "asc",
        })
      );
    } else {
      dispatch(
        setScheduleProjectionSorting({
          sort: _sort,
          direction: "asc",
        })
      );
    }
  };

  const renderSortingIcon = (_sort: ScheduleTicketColumns) => {
    if (_sort === sort) {
      if (direction === "asc") {
        return (
          <ChevronDownIcon className="relative -top-px ml-0.5 inline-block h-4 w-4" />
        );
      } else {
        return (
          <ChevronUpIcon className="relative -top-px ml-0.5 inline-block h-4 w-4" />
        );
      }
    }
    return null;
  };

  return (
    <div className="relative">
      {requiresRefresh && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center space-y-4 rounded-lg bg-white bg-opacity-25 backdrop-blur-sm">
          <div className="text-xl font-semibold text-gray-800">
            Your schedule has changed
          </div>
          <p className="text-base font-medium text-gray-700">
            It looks like you have made some changes to your schedule, click
            below to refresh it.
          </p>
          <Button
            onClick={onLoadProjection}
            type="button"
            btnSize="large"
            btnType="primary"
          >
            Generate Predictions
          </Button>
        </div>
      )}
      <WarningConfirm
        title={`Reset all schedule?`}
        visible={isConfirmResetVisible}
        onClose={() => setConfirmResetVisible(false)}
        cta={`Yes, reset ticket and priorities`}
        description="Confirm you want to undo all the changes to the schedule. This action cannot be undone."
        onConfirm={() => dispatch(resetSchedule())}
      />

      <ConfirmModal
        title={`Apply changes to the schedule?`}
        visible={isConfirmCommitVisible}
        onClose={() => setConfirmCommitVisible(false)}
        cta={`Yes, commit changes`}
        description="Changing the schedule will trigger a recomputation of your expected delivery date, this process can take up to two minutes."
        onConfirm={() =>
          commitScheduleChanges({
            variables: {
              addTicketIds: map(addedTickets, "id"),
              removeTicketIds: map(removedTickets, "id"),
              scheduleConfigs: map(scheduleConfigs, (config, index) => ({
                priority: index + 1,
                projectIds: map(config.filter.recordSets.projects, "id"),
                productIds: map(config.filter.recordSets.products, "id"),
                workflowIds: map(config.filter.recordSets.workflows, "id"),
                tagIds: map(config.filter.recordSets.tags, "id"),
                ticketIds: map(config.filter.recordSets.tickets, "id"),
              })),
            },
          })
        }
        icon={<CalendarIcon className="h-6 w-6 text-brand-600" />}
      />

      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="relative overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:max-h-[calc(100vh-254px)] md:min-h-[24rem] md:overflow-y-auto md:overflow-x-hidden md:rounded-lg">
              <table className="min-w-full ">
                <thead className="sticky top-0 bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="whitespace-nowrap py-3.5 pl-4 pr-3 text-left text-xs font-medium leading-4 tracking-wider text-gray-500 sm:pl-6"
                    >
                      <button
                        className="uppercase"
                        type="button"
                        onClick={setSorting("title")}
                      >
                        Title
                        {renderSortingIcon("title")}
                      </button>
                    </th>
                    <th
                      scope="col"
                      className="whitespace-nowrap px-3 py-3.5 text-left text-xs font-medium leading-4 tracking-wider text-gray-500"
                    >
                      <button
                        className="uppercase"
                        type="button"
                        onClick={setSorting("workflowName")}
                      >
                        Workflow
                        {renderSortingIcon("workflowName")}
                      </button>
                    </th>
                    <th
                      scope="col"
                      className="whitespace-nowrap px-3 py-3.5 text-left text-xs font-medium leading-4 tracking-wider text-gray-500"
                    >
                      <button
                        className="uppercase"
                        type="button"
                        onClick={setSorting("newEta")}
                      >
                        Projected Completion
                        {renderSortingIcon("newEta")}
                      </button>
                    </th>
                    <th
                      scope="col"
                      className="whitespace-nowrap px-3 py-3.5 text-left text-xs font-medium leading-4 tracking-wider text-gray-500"
                    >
                      <button
                        className="uppercase"
                        type="button"
                        onClick={setSorting("delta")}
                      >
                        Change
                        {renderSortingIcon("delta")}
                      </button>
                    </th>
                  </tr>
                  <tr>
                    <th className="h-px bg-gray-200 p-0" colSpan={6}></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {sortedRows.map(renderProjectionRow)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 hidden flex-row items-center justify-between md:flex">
        <Button
          onClick={() => setConfirmResetVisible(true)}
          type="button"
          btnType="warning"
          fullInMobile
        >
          <RefreshIcon className="mr-1 -ml-0.5 h-4 w-4" />
          Reset Scheduled
        </Button>
        <div className="text-sm font-normal text-gray-500">
          Powered by{" "}
          <span className="font-medium text-gray-600">Autopilot</span>
        </div>
        <div className="flex flex-row space-x-2">
          <Button
            asElement={(className) => (
              <Link
                to={urlResolver.schedule.editPriorities(orgId)}
                className={className}
              >
                <ChevronLeftIcon className="mr-1 -ml-0.5 h-4 w-4" />
                Priorities
              </Link>
            )}
            type="button"
            btnType="white"
            fullInMobile
          />

          <Button
            type="button"
            btnType="primary"
            onClick={() => setConfirmCommitVisible(true)}
            fullInMobile
          >
            Commit Schedule
          </Button>
        </div>
      </div>

      <div className="mt-4 flex flex-col space-y-2 px-2 md:hidden">
        <Button
          onClick={() => setConfirmResetVisible(true)}
          type="button"
          btnType="warning"
          fullInMobile
        >
          <RefreshIcon className="mr-1 -ml-0.5 h-4 w-4" />
          Reset Scheduled
        </Button>

        <Button
          asElement={(className) => (
            <Link
              to={urlResolver.schedule.editPriorities(orgId)}
              className={className}
            >
              <ChevronLeftIcon className="mr-1 -ml-0.5 h-4 w-4" />
              Priorities
            </Link>
          )}
          type="button"
          btnType="white"
          fullInMobile
        />

        <Button
          type="button"
          btnType="primary"
          onClick={() => setConfirmCommitVisible(true)}
          fullInMobile
        >
          Commit Schedule
        </Button>
      </div>
    </div>
  );
};

ScheduleProjections.fragments = {
  ScheduleProjectionsFragment: gql`
    fragment ScheduleProjectionsFragment on PlanningTicket {
      id
      title
      eta
      productCode
      localId
      workflowName
      productName
      milestone
    }
  `,
  ScheduleProjectionsScheduleConfigFragment: gql`
    fragment ScheduleProjectionsScheduleConfigFragment on ScheduleConfig {
      id
      priority
      products {
        id
        name
        code
      }

      projects {
        id
        name
        parentId
      }

      tags {
        id
        name
      }

      workflows {
        id
        name
      }

      tickets {
        id
        title
      }
    }
  `,
};

const GET_SCHEDULE_PROJECTION_QUERY = gql`
  query GetScheduleProjection(
    $ticketIds: [Int!]!
    $scheduleConfigs: [ScheduleConfigForEstimateInput]!
  ) {
    planningProjection(
      ticketIds: $ticketIds
      scheduleConfigs: $scheduleConfigs
    ) {
      id
      ...ScheduleProjectionsFragment
    }
  }
  ${ScheduleProjections.fragments.ScheduleProjectionsFragment}
`;

const GET_SCHEDULED_TICKET_QUERY = gql`
  query getSchdeduledTicketForProjection {
    getScheduledTickets {
      id
      title
      eta
      milestone
      product {
        id
        code
        name
      }
      workflow {
        id
        name
      }
    }
  }
`;

const MUTATE_COMMIT_SCHEDULE_CHANGES = gql`
  mutation commitScheduleChanges(
    $removeTicketIds: [Int]!
    $addTicketIds: [Int]!
    $scheduleConfigs: [UpdateScheduleConfig]!
  ) {
    commitScheduleChanges(
      removeTicketIds: $removeTicketIds
      addTicketIds: $addTicketIds
      scheduleConfigs: $scheduleConfigs
    )
  }
`;

const GET_SCHEDULE_CONFIG_QUERY = gql`
  query GetScheduleConfigsForScheduleProjection {
    scheduleConfigs {
      ...ScheduleProjectionsScheduleConfigFragment
    }
  }
  ${ScheduleProjections.fragments.ScheduleProjectionsScheduleConfigFragment}
`;

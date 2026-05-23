import React, { useState } from "react";
import { ScheduleTabs } from "../Tabs/ScheduleTabs";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { isAdminLevel } from "reducers/selector";
import { Button } from "components/fields/Button";
import { urlResolver } from "utils/navigation";
import { gql, useQuery } from "@apollo/client";
import { QueryReturnValue } from "types/queryTypes";
import { Avatar } from "components/views/Avatar";
import { every, filter, find, keyBy, reduce } from "lodash";
import { Role, Ticket } from "types/graphql";
import { useAppDispatch } from "store";
import { showTicketEditModal } from "actions";
import { SwimlaneTicket } from "./SwimlaneTicket";
import { SwimlaneFirstTicket } from "./SwimlaneFirstTicket";
import { SwimlaneTask } from "./types";
import cn from "classnames";
import { TicketChangeAssigneeModal } from "pages/ticket/TicketView/TicketActivity/TicketChangeAssigneeAndStartModal";
import { convertToMiniRole } from "components/fields/convertToMini";

export const SwimlaneView: React.FC = () => {
  const { orgId } = useParams<{ orgId: string }>();
  const dispatch = useAppDispatch();
  const isAdmin = useSelector(isAdminLevel);

  const [dragTask, setDragTask] = useState<SwimlaneTask | null>();
  const [dragoverRoleId, setDragoverRoleId] = useState<number | null>();
  const [droppedTask, setDroppedTask] = useState<SwimlaneTask | null>();
  const [droppedRole, setDroppedRole] = useState<Role | null>();
  const [dragRoleId, setDragRoleId] = useState<number | null>();
  const [dragCategory, setDragCategory] = useState<
    "current" | "next" | "upcoming" | "estimating" | null
  >(null);

  const { data: ticketData, refetch } = useQuery<
    QueryReturnValue["getAllScheduledTasks"]
  >(GET_ALL_SCHEDULED_TASKS);

  const { data: roleData } =
    useQuery<QueryReturnValue["getAllRoles"]>(GET_ALL_ROLES);

  const { data: estimatingData } = useQuery<
    QueryReturnValue["getAllAwaitingEstimateTasks"]
  >(GET_ALL_AWAITING_ESTIMATE_TASKS);

  const tickets = ticketData?.getAllScheduledTasks || [];
  const roles = roleData?.getAllRoles || [];
  const estimatingTickets = estimatingData?.getAllAwaitingEstimateTasks || [];
  const roleById = keyBy(roles, "id");

  const getEstimatingTickets = (
    roleId: number,
    tickets: Ticket[]
  ): SwimlaneTask[] => {
    const tasks: SwimlaneTask[] = [];

    for (const ticket of tickets) {
      const states = filter(ticket.ticketWorkflowStates, {
        assigneeId: roleId,
      });

      for (const state of states) {
        if (
          state.isActive &&
          !every([
            state.estimateMaximum,
            state.estimateMinimum,
            state.estimateMinimum,
          ])
        ) {
          tasks.push({ ticket, state });
        }
      }
    }

    return tasks;
  };

  const getUpcomingTickets = (
    roleId: number,
    tickets: Ticket[]
  ): SwimlaneTask[] => {
    const upcomingTickets: SwimlaneTask[] = [];

    for (const ticket of tickets) {
      const { position } = ticket.lastScheduleItem
        ? ticket.lastScheduleItem.nextTicketWorkflowState ||
          ticket.lastScheduleItem.ticketWorkflowState
        : ticket.ticketWorkflowStates[0];

      const upcoming = find(
        ticket.ticketWorkflowStates,
        (tws) => tws.position > position && tws.assigneeId === roleId
      );

      if (upcoming) {
        upcomingTickets.push({ ticket, state: upcoming });
      }
    }

    return upcomingTickets;
  };

  const getCurrentTask = (
    roleId: number,
    tickets: Ticket[]
  ): SwimlaneTask | null => {
    for (const ticket of tickets) {
      const scheduleItem = ticket.lastScheduleItem;
      if (
        scheduleItem &&
        !scheduleItem.stoppedAt &&
        scheduleItem.roleId === roleId
      ) {
        return {
          ticket,
          state: scheduleItem.ticketWorkflowState,
          scheduleItem: scheduleItem,
        };
      }
    }

    return null;
  };

  const getPausedTasks = (roleId: number, tickets: Ticket[]): SwimlaneTask[] =>
    reduce(
      tickets,
      (acc: SwimlaneTask[], ticket) => {
        const scheduleItem = ticket.lastScheduleItem;
        if (
          scheduleItem &&
          scheduleItem.roleId === roleId &&
          scheduleItem.stoppedAt &&
          !scheduleItem.nextTicketWorkflowState
        ) {
          return [
            ...acc,
            {
              ticket,
              state: scheduleItem.ticketWorkflowState,
              scheduleItem,
            },
          ];
        }
        return acc;
      },
      []
    );

  const getNextTasks = (roleId: number, tickets: Ticket[]): SwimlaneTask[] =>
    reduce(
      tickets,
      (acc: SwimlaneTask[], ticket) => {
        const scheduleItem = ticket.lastScheduleItem;

        if (scheduleItem) {
          // if there is a next ticket workflow state it means this
          // is an unstarted stage that is assigned to us
          if (scheduleItem?.nextTicketWorkflowState) {
            if (scheduleItem?.nextTicketWorkflowState.assigneeId === roleId) {
              return [
                ...acc,
                {
                  ticket,
                  state: scheduleItem.nextTicketWorkflowState,
                  scheduleItem: scheduleItem,
                },
              ];
            }
          }
        } else {
          // if there is no schedule item, then the assignee is the
          // first active state
          if (ticket.ticketWorkflowStates[0].assigneeId === roleId) {
            return [
              ...acc,
              {
                ticket,
                state: ticket.ticketWorkflowStates[0],
              },
            ];
          }
        }
        // if there is no schedule item, this is also an unstarted
        // stage that is assigned to us
        return acc;
      },
      []
    );

  const renderCurrentTicket = (roleId: number, tickets: Ticket[]) => {
    const currentTask = getCurrentTask(roleId, tickets);

    const tasks = currentTask
      ? [currentTask, ...getPausedTasks(roleId, tickets)]
      : getPausedTasks(roleId, tickets);

    return (
      <SwimlaneFirstTicket
        tasks={tasks}
        renderTask={(task, className) => (
          <SwimlaneTicket
            onClick={() => dispatch(showTicketEditModal(task.ticket.id))}
            role="button"
            ticket={task.ticket}
            state={task.state}
            scheduleItem={task.scheduleItem}
            className={className}
          />
        )}
      />
    );
  };

  const renderNextTickets = (roleId: number, tickets: Ticket[]) => {
    const tasks = getNextTasks(roleId, tickets);

    if (dragTask && dragCategory === "next" && dragRoleId !== roleId) {
      return (
        <div
          onDragOver={(event) => event.preventDefault()}
          onDragEnter={() => setTimeout(() => setDragoverRoleId(roleId), 20)}
          onDragLeave={() => setDragoverRoleId(null)}
          onDrop={() => {
            setDroppedRole(roleById[roleId]);
            setDroppedTask(dragTask);

            setDragTask(null);
            setDragCategory(null);
            setDragRoleId(null);
            setDragoverRoleId(null);
          }}
          className={cn(
            "absolute inset-x-4 inset-y-2 flex flex-col items-center justify-center rounded-lg border-2 text-sm font-medium",
            {
              "border-dashed border-sky-400 bg-sky-100 text-sky-500":
                dragoverRoleId === roleId,
              "border-sky-200 bg-sky-50 text-sky-400":
                dragoverRoleId !== roleId,
            }
          )}
        >
          <p className="pointer-events-none whitespace-normal px-4 text-center text-sm font-medium">
            drop here to change assignee for
            <span className="block font-bold">{dragTask.state.name}</span>
          </p>
        </div>
      );
    }

    return (
      <SwimlaneFirstTicket
        tasks={tasks}
        renderTask={(task, className) => (
          <SwimlaneTicket
            draggable
            onClick={() => dispatch(showTicketEditModal(task.ticket.id))}
            role="button"
            ticket={task.ticket}
            state={task.state}
            scheduleItem={task.scheduleItem}
            className={className}
            onDragEnd={() => {
              setDragTask(null);
              setDragCategory(null);
              setDragRoleId(null);
              setDragoverRoleId(null);
            }}
            onDragStart={() => {
              setDragTask(task);
              setDragCategory("next");
              setDragRoleId(roleId);
            }}
          />
        )}
      />
    );
  };

  const renderUpcomingTickets = (roleId: number, tickets: Ticket[]) => {
    const tasks = getUpcomingTickets(roleId, tickets);

    if (dragTask && dragCategory === "upcoming" && dragRoleId !== roleId) {
      return (
        <div
          onDragOver={(event) => event.preventDefault()}
          onDragEnter={() => setTimeout(() => setDragoverRoleId(roleId), 20)}
          onDragLeave={() => setDragoverRoleId(null)}
          onDrop={() => {
            setDroppedRole(roleById[roleId]);
            setDroppedTask(dragTask);

            setDragTask(null);
            setDragCategory(null);
            setDragRoleId(null);
            setDragoverRoleId(null);
          }}
          className={cn(
            "absolute inset-x-4 inset-y-2 flex flex-col items-center justify-center rounded-lg border-2 text-sm font-medium",
            {
              "border-dashed border-sky-400 bg-sky-100 text-sky-500":
                dragoverRoleId === roleId,
              "border-sky-200 bg-sky-50 text-sky-400":
                dragoverRoleId !== roleId,
            }
          )}
        >
          <p className="pointer-events-none whitespace-normal px-4 text-center text-sm font-medium">
            drop here to change assignee for
            <span className="block font-bold">{dragTask.state.name}</span>
          </p>
        </div>
      );
    }

    return (
      <SwimlaneFirstTicket
        tasks={tasks}
        renderTask={(task, className) => (
          <SwimlaneTicket
            draggable
            onClick={() => dispatch(showTicketEditModal(task.ticket.id))}
            role="button"
            ticket={task.ticket}
            state={task.state}
            scheduleItem={task.scheduleItem}
            className={className}
            onDragEnd={() => {
              setDragTask(null);
              setDragCategory(null);
              setDragRoleId(null);
              setDragoverRoleId(null);
            }}
            onDragStart={() => {
              setDragTask(task);
              setDragCategory("upcoming");
              setDragRoleId(roleId);
            }}
          />
        )}
      />
    );
  };

  const renderEstimatingTickets = (roleId: number, tickets: Ticket[]) => {
    const tasks = getEstimatingTickets(roleId, tickets);

    return (
      <SwimlaneFirstTicket
        tasks={tasks}
        renderTask={(task, className) => (
          <SwimlaneTicket
            onClick={() => dispatch(showTicketEditModal(task.ticket.id))}
            role="button"
            ticket={task.ticket}
            state={task.state}
            scheduleItem={task.scheduleItem}
            className={className}
          />
        )}
      />
    );
  };

  return (
    <div className={cn("group mx-auto", { "is-dragging": !!dragTask })}>
      <div>
        <div className="mx-auto max-w-7xl lg:flex lg:flex-col">
          <header className="flex min-w-0 items-center justify-between space-x-2 px-6 py-4 md:flex-none lg:px-0">
            <h1 className="flex min-w-0 flex-row items-center space-x-1 text-2xl text-gray-600 sm:font-medium">
              <span className="hidden truncate lg:block">Swimlanes</span>
            </h1>

            <ScheduleTabs orgId={orgId} current="Swimlanes" />

            {isAdmin ? (
              <div className="hidden md:ml-4 md:flex md:items-center">
                <Button
                  btnType="primary"
                  asElement={(className) => (
                    <Link
                      className={className}
                      to={urlResolver.schedule.editTickets(orgId)}
                    >
                      Edit Schedule
                    </Link>
                  )}
                ></Button>
              </div>
            ) : (
              <div></div>
            )}
          </header>
        </div>
        {droppedTask && (
          <TicketChangeAssigneeModal
            ticket={droppedTask.ticket}
            ticketWorkflowState={droppedTask.state}
            visible={true}
            cta="Change Assignee"
            onClose={() => setDroppedTask(null)}
            role={convertToMiniRole(droppedRole)}
            onConfirm={() => refetch()}
          />
        )}
        <div className="sm:-mx-6 md:-mx-8 3xl:mx-auto 3xl:max-w-[1700px]">
          <div className="relative max-h-[calc(100vh-145px)] w-full overflow-auto overscroll-contain 3xl:max-h-[calc(100vh-160px)] 3xl:rounded-lg 3xl:shadow-lg">
            <table className="w-full whitespace-nowrap text-left">
              <thead className="overflow-hidden bg-white text-sm leading-6 text-gray-800">
                <tr className="divide-x divide-gray-300">
                  <th
                    scope="col"
                    className="sticky left-0 top-0 z-30 bg-white p-2 text-center font-semibold"
                  >
                    Role
                    <div className="absolute inset-x-0 bottom-0 h-px bg-gray-300"></div>
                    <div className="absolute inset-y-0 right-0 w-px bg-gray-300"></div>
                  </th>
                  <th
                    scope="col"
                    className="sticky top-0 z-20 bg-white p-2 text-center font-semibold"
                  >
                    Unfinished task
                    <div className="absolute inset-x-0 bottom-0 h-px bg-gray-300"></div>
                  </th>
                  <th
                    scope="col"
                    className="sticky top-0 z-20 bg-white p-2 text-center font-semibold"
                  >
                    Ready to start
                    <div className="absolute inset-x-0 bottom-0 h-px bg-gray-300"></div>
                  </th>
                  <th
                    scope="col"
                    className="sticky top-0 z-20 bg-white p-2 text-center font-semibold"
                  >
                    Upcoming task
                    <div className="absolute inset-x-0 bottom-0 h-px bg-gray-300"></div>
                  </th>
                  <th
                    scope="col"
                    className="sticky top-0 z-20 bg-white p-2 text-center font-semibold"
                  >
                    Awaiting estimate
                    <div className="absolute inset-x-0 bottom-0 h-px bg-gray-300"></div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-solid bg-white">
                {roles.map((role) => (
                  <tr key={role.id} className="divide-x divide-gray-300">
                    <td className="sticky left-0 z-10 bg-white p-4 sm:table-cell">
                      <div className="absolute inset-y-0 right-0 w-px bg-gray-300"></div>
                      <div className="flex items-center gap-x-4">
                        <Avatar
                          name={role.name}
                          src={role.avatarUrl}
                          alt=""
                          className="h-10 w-10 rounded-lg bg-gray-800"
                        />
                        <div className="truncate text-sm font-medium leading-6 text-gray-800">
                          <div className="truncate" title={role.name}>
                            {role.name}
                          </div>
                          <div
                            title={`${role.title}`}
                            className="truncate text-xs font-normal text-gray-600"
                          >
                            {role.title}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="relative px-4 py-3 sm:table-cell">
                      {renderCurrentTicket(role.id, tickets)}
                    </td>
                    <td className="relative px-4 py-3 sm:table-cell">
                      <div className={cn("")}>
                        {renderNextTickets(role.id, tickets)}
                      </div>
                    </td>
                    <td className="relative px-4 py-3 sm:table-cell">
                      <div>{renderUpcomingTickets(role.id, tickets)}</div>
                    </td>
                    <td className="relative px-4 py-3 sm:table-cell">
                      <div>
                        {renderEstimatingTickets(role.id, estimatingTickets)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const GET_ALL_SCHEDULED_TASKS = gql`
  query getAllScheduledTasks {
    getAllScheduledTasks {
      id
      localId
      title
      ...SwimlaneTicketFragment
      product {
        id
        code
        name
      }
      workflow {
        id
        name
      }
      lastScheduleItem {
        id
        roleId
        ticketWorkflowState {
          id
          name
          position
          isActive
          assigneeId
          ...TicketChangeAssigneeModalWorkflowStateFragment
        }
        nextTicketWorkflowState {
          id
          name
          position
          isActive
          assigneeId
          ...TicketChangeAssigneeModalWorkflowStateFragment
        }
      }
      ticketWorkflowStates {
        id
        isBlocked
        name
        position
        isActive
        assigneeId
        estimateMinimum
        ...TicketChangeAssigneeModalWorkflowStateFragment
      }
    }
  }
  ${SwimlaneTicket.fragments.SwimlaneTicketFragment}
  ${TicketChangeAssigneeModal.fragments
    .TicketChangeAssigneeModalWorkflowStateFragment}
`;

const GET_ALL_AWAITING_ESTIMATE_TASKS = gql`
  query getAllAwaitingEstimateTasks {
    getAllAwaitingEstimateTasks {
      id
      localId
      title
      product {
        id
        code
        name
      }
      workflow {
        id
        name
      }
      ticketWorkflowStates {
        id
        name
        position
        isActive
        assigneeId
      }
    }
  }
`;

const GET_ALL_ROLES = gql`
  query getAllRoles {
    getAllRoles {
      id
      name
      avatarUrl
      title
    }
  }
`;

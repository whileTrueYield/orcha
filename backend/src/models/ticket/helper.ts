import prisma from "../../prisma";
import {
  clamp,
  filter,
  findLast,
  first,
  keyBy,
  last,
  map,
  orderBy,
  reduce,
  some,
  sortBy,
  trim,
} from "lodash";
import {
  Ticket,
  TicketStatus,
  ModelStage,
  RoleStatus,
} from "@prisma/client";
import { GetPageArgsFor, paginateNodes } from "../../utils/pagination";
import {
  MyUpcomingAssignedTicketShape,
  NextTicketShape,
} from "./entity";
import { Prisma, ScheduleItem, TicketWorkflowState } from "@prisma/client";
import { getProjectDescendantIds } from "../project/helper";
import { subDays } from "date-fns";

interface GetPageArgs extends GetPageArgsFor<Ticket> {
  allUntagged?: boolean;
  assigneeIds?: number[];
  atRisk?: boolean;
  authorId?: number;
  authorIds?: number[];
  closedAtFilter?: string;
  createdAtFilter?: string;
  etaFilter?: string;
  featureIds?: number[];
  projectId?: number;
  hideCompleted?: boolean;
  intersectTagIds?: number[];
  isActive?: boolean;
  isReadyToSchedule?: boolean;
  organizationId: number;
  ownerId?: number;
  ownerIds?: number[];
  productId?: number;
  productIds?: number[];
  recursive?: boolean;
  roleId?: number;
  stages?: ModelStage[];
  statuses?: TicketStatus[];
  tagId?: number;
  tagIds?: number[];
  unassigned?: boolean;
  unestimated?: boolean;
  unfinished?: boolean;
  untagged?: boolean;
  watched?: boolean;
  workflowId?: number;
  workflowIds?: number[];
  publishedProjectOnly?: boolean;
  recentlyCreated?: boolean;
}

export async function getPaginatedTickets(
  args: GetPageArgs,
) {
  const {
    allUntagged,
    assigneeIds,
    authorId,
    authorIds,
    closedAtFilter,
    createdAtFilter,
    cursor,
    etaFilter,
    featureIds,
    first,
    hideCompleted,
    intersectTagIds,
    isActive,
    isReadyToSchedule,
    last,
    organizationId,
    ownerId,
    ownerIds,
    productId,
    productIds,
    projectId,
    recursive,
    roleId,
    search,
    stages,
    statuses,
    tagId,
    tagIds,
    unassigned,
    unestimated,
    unfinished,
    untagged,
    watched,
    workflowId,
    workflowIds,
    publishedProjectOnly,
    recentlyCreated,
  } = args;

  // default offset to be at the start (or the end
  // depending on direction)
  const offset = cursor ? 1 : args.offset ? args.offset : 0;

  // by default sort on createdAt
  const sort: keyof Ticket = args.sort ? args.sort : "createdAt";

  // by default sort direction should be ascending
  const direction: Prisma.SortOrder = args.last
    ? Prisma.SortOrder.desc
    : Prisma.SortOrder.asc;

  // first (or last) X defines the number of item per page
  // the fallback is 10 if not provided
  const requestedPageSize = first || last || 10;
  const pageSize = clamp(requestedPageSize, 1, 50);

  const ticketQuery: Prisma.TicketWhereInput = {
    organizationId,
  };

  const whereAND: Prisma.Enumerable<Prisma.TicketWhereInput> = [];

  // if stages are not provided, default to returning published
  // items and the current role's Draft documents
  if (stages?.length) {
    // Ticket contained in an archived folder are also marked as archived
    if (stages.includes(ModelStage.ARCHIVED)) {
      whereAND.push({
        OR: [
          {
            stage: { in: stages, not: ModelStage.DELETED },
          },
          {
            project: { stage: ModelStage.ARCHIVED },
          },
          {
            project: { stage: ModelStage.PUBLISHED, ancestorIsArchived: true },
          },
        ],
      });
    } else {
      whereAND.push({
        stage: { in: stages, not: ModelStage.DELETED },
      });
    }
  } else if (roleId) {
    // the default personalized ticket listing will display:
    // - unscheduled tickets
    // - scheduled tickets
    // - draft tickets authored by the individual
    const whereOR: Prisma.TicketWhereInput[] = [
      { stage: ModelStage.DRAFT, authorId: roleId },
    ];

    if (hideCompleted) {
      whereOR.push({
        stage: ModelStage.PUBLISHED,
        status: { in: [TicketStatus.SCHEDULED, TicketStatus.UNSCHEDULED] },
      });
    } else {
      whereOR.push({
        stage: ModelStage.PUBLISHED,
      });
    }

    whereAND.push({ OR: whereOR });
  } else {
    whereAND.push({ stage: { not: ModelStage.DELETED } });
  }

  if (publishedProjectOnly) {
    whereAND.push({
      project: {
        stage: ModelStage.PUBLISHED,
        ancestorIsArchived: false,
      },
    });
  }

  if (recentlyCreated) {
    whereAND.push({
      createdAt: { gte: subDays(new Date(), 30) },
    });
  }

  ticketQuery.AND = whereAND;

  // We allow search on tickets by their description and title
  const query = trim(search);
  if (query) {
    ticketQuery.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
    ];

    // in case the search is the product code + the ticket ID
    const parts = /([a-z]+)[^\d]?(\d+)/gi.exec(query);
    if (parts) {
      const productCode = parts[1];
      const ticketLocalId = parts[2];

      ticketQuery.OR.push({
        AND: [
          { localId: parseInt(ticketLocalId) },
          { product: { code: { contains: productCode, mode: "insensitive" } } },
        ],
      });
    }
  }

  if (productId) {
    ticketQuery.productId = productId;
  }

  if (authorId) {
    ticketQuery.authorId = authorId;
  }

  if (workflowId) {
    ticketQuery.workflowId = workflowId;
  }

  if (ownerId) {
    ticketQuery.ownerId = ownerId;
  }

  if (workflowIds?.length) {
    ticketQuery.workflowId = { in: workflowIds };
  }

  if (tagId) {
    ticketQuery.tags = { some: { id: tagId } };
  }

  if (productIds?.length) {
    ticketQuery.productId = { in: productIds };
  }

  if (projectId) {
    if (recursive) {
      // search in sub projects here
      ticketQuery.projectId = {
        in: [projectId, ...(await getProjectDescendantIds(projectId))],
      };
    } else {
      ticketQuery.projectId = projectId;
    }
  }

  if (authorIds?.length) {
    ticketQuery.authorId = { in: authorIds };
  }

  if (ownerIds?.length) {
    ticketQuery.ownerId = { in: ownerIds };
  }

  if (statuses?.length) {
    ticketQuery.status = { in: statuses };
  }

  if (assigneeIds?.length) {
    ticketQuery.ticketWorkflowStates = {
      some: {
        assigneeId: { in: assigneeIds },
      },
    };
  }

  if (featureIds?.length) {
    ticketQuery.features = {
      some: {
        id: { in: featureIds },
      },
    };
  }

  if (tagIds?.length) {
    ticketQuery.tags = {
      some: {
        id: { in: tagIds },
      },
    };
  }

  if (watched && roleId) {
    ticketQuery.watchers = {
      some: {
        id: { in: [roleId] },
      },
    };
  }

  // if we require all the not tagged ticket
  if (allUntagged) {
    ticketQuery.tags = { none: {} };
  }

  if (unfinished || unassigned || unestimated) {
    ticketQuery.stage = ModelStage.PUBLISHED;
    ticketQuery.status = {
      in: [TicketStatus.SCHEDULED, TicketStatus.UNSCHEDULED],
    };
  }

  if (unassigned) {
    ticketQuery.ticketWorkflowStates = {
      some: {
        isActive: true,
        assigneeId: null,
      },
    };
  }

  if (unestimated) {
    ticketQuery.ticketWorkflowStates = {
      some: {
        isActive: true,
        OR: [
          { estimateMaximum: null },
          { estimateMinimum: null },
          { estimateMostLikely: null },
        ],
      },
    };
  }

  // This is a union select, every ticket must have the specified tags
  // Note the else, we only want to do that if we did not request all the untagged tickets
  else if (intersectTagIds) {
    for (const tagId of intersectTagIds) {
      ticketQuery.AND.push({
        tags: {
          some: {
            id: tagId,
          },
        },
      });
    }
  }

  if (isReadyToSchedule) {
    ticketQuery.status = TicketStatus.UNSCHEDULED;

    ticketQuery.project = {
      stage: ModelStage.PUBLISHED,
      ancestorIsArchived: false,
    };

    ticketQuery.ticketWorkflowStates = {
      every: {
        OR: [
          {
            estimateMinimum: { not: null },
            estimateMostLikely: { not: null },
            estimateMaximum: { not: null },
            assignee: { status: RoleStatus.ACCEPTED },
            isActive: true,
          },
          { isActive: false },
        ],
      },
    };
  }

  if (isActive) {
    ticketQuery.scheduleItems = {
      some: {
        stoppedAt: null,
      },
    };
  }

  if (untagged) {
    ticketQuery.tags = { none: {} };
  }

  if (createdAtFilter) {
    const [afterDate, beforeDate] = createdAtFilter.split("|");
    if (afterDate && beforeDate) {
      ticketQuery.createdAt = {
        gte: new Date(afterDate),
        lte: new Date(beforeDate),
      };
    } else if (afterDate) {
      ticketQuery.createdAt = { gte: new Date(afterDate) };
    } else if (beforeDate) {
      ticketQuery.createdAt = { lte: new Date(beforeDate) };
    }
  }

  if (etaFilter) {
    const [afterDate, beforeDate] = etaFilter.split("|");
    if (afterDate && beforeDate) {
      ticketQuery.eta = {
        gte: new Date(afterDate),
        lte: new Date(beforeDate),
      };
    } else if (afterDate) {
      ticketQuery.eta = { gte: new Date(afterDate) };
    } else if (beforeDate) {
      ticketQuery.eta = { lte: new Date(beforeDate) };
    }
  }

  if (closedAtFilter) {
    const [afterDate, beforeDate] = closedAtFilter.split("|");
    if (afterDate && beforeDate) {
      ticketQuery.closedAt = {
        gte: new Date(afterDate),
        lte: new Date(beforeDate),
      };
    } else if (afterDate) {
      ticketQuery.closedAt = { gte: new Date(afterDate) };
    } else if (beforeDate) {
      ticketQuery.closedAt = { lte: new Date(beforeDate) };
    }
  }

  const tickets = await prisma.ticket.findMany({
    where: ticketQuery,
    skip: offset,
    take: pageSize,
    orderBy: getTicketSorting(sort.toString(), direction),
    cursor: cursor ? { id: cursor } : undefined,
    include: {
      ticketWorkflowStates: {
        include: {
          assignee: true,
        },
      },
      scheduleItems: {
        include: {
          nextTicketWorkflowState: { include: { assignee: true } },
          ticketWorkflowState: true,
          role: true,
        },
        orderBy: { startedAt: "desc" },
        take: 1,
      },
      workflow: true,
      product: true,
      project: true,
    },
  });

  const count = await prisma.ticket.count({ where: ticketQuery });
  return paginateNodes({ nodes: tickets, offset, pageSize, count });
}

export const getTicketSorting = (
  sort: string,
  direction: Prisma.SortOrder,
): Prisma.Enumerable<Prisma.TicketOrderByWithRelationInput> => {
  if (sort === "localId") {
    return [
      {
        product: {
          code: direction,
        },
      },
      { localId: direction },
    ];
  }

  if (sort === "workflow") {
    return {
      workflow: {
        name: direction,
      },
    };
  }

  if (sort === "product") {
    return {
      product: {
        name: direction,
      },
    };
  }

  if (sort === "author") {
    return {
      author: {
        name: direction,
      },
    };
  }

  if (sort === "project") {
    return {
      project: {
        name: direction,
      },
    };
  }

  if (sort === "status") {
    return [{ stage: direction }, { status: direction }];
  }

  return { [sort]: direction };
};

interface GetMyUpcomingTicketsArgs {
  roleId: number;
  organizationId: number;
}
export const getMyUpcomingTickets = async ({
  roleId,
  organizationId,
}: GetMyUpcomingTicketsArgs) => {
  // grab all the tickets the current user is planned to work on
  const tickets = await prisma.ticket.findMany({
    where: {
      organizationId: organizationId,
      status: TicketStatus.SCHEDULED,
      stage: ModelStage.PUBLISHED,
      ticketWorkflowStates: {
        some: { assigneeId: { in: [roleId] } },
      },
    },
    include: {
      product: true,
      author: true,
      ancestors: {
        include: {
          scheduleItems: {
            orderBy: { startedAt: "desc" },
            take: 1,
          },
        },
      },
      ticketWorkflowStates: {
        orderBy: { position: "asc" },
        where: { isActive: true },
        include: {
          assignee: true,
        },
      },
      scheduleItems: {
        orderBy: { startedAt: "desc" },
        take: 1,
        include: {
          ticketWorkflowState: {
            include: {
              assignee: true,
            },
          },
        },
      },
    },
  });

  // we now have all the tickets where the current user is involved,
  // we check if the previous state is actively worked on
  const upcomingTickets = reduce(
    tickets,
    (acc: MyUpcomingAssignedTicketShape[], ticket): MyUpcomingAssignedTicketShape[] => {
      const lastItem = last(ticket.scheduleItems);

      // we are only interrested if the current user is part of any
      // upcoming work
      if (lastItem) {
        // we recorded some work on it, let see if the work we're supposed
        // to do is after the last recorded work

        // we should ignore the ticket if we're currently working on it
        if (lastItem.ticketWorkflowState.assigneeId === roleId) {
          return acc;
        }

        // current position
        const { position } = lastItem.ticketWorkflowState;

        // what is the next step after the current one?
        const index = findLast(ticket.ticketWorkflowStates, {
          assigneeId: roleId,
        });

        if (index && position < index.position) {
          // you have some future work to do on this ticket
          const currentState = getTicketCurrentState(
            ticket.ticketWorkflowStates,
            lastItem,
          );

          const isDone = !!lastItem.nextTicketWorkflowStateId;
          const isPaused = !isDone && !!lastItem.stoppedAt;
          const isActive = !isPaused && !lastItem.stoppedAt;

          return [
            ...acc,
            {
              ticket,
              lastState: lastItem.ticketWorkflowState,
              currentState,
              isStarted: true,
              isActive,
              isPaused,
              isDone,
              isNext: currentState.assigneeId === roleId,
            },
          ];
        }
      } else {
        // no work has ever been recorded on this ticket, this mean
        // you are expected to do some work on it in the future
        const currentState = getTicketCurrentState(
          ticket.ticketWorkflowStates,
          lastItem,
        );

        return [
          ...acc,
          {
            ticket,
            currentState,
            lastState: null,
            isActive: false,
            isStarted: false,
            isPaused: false,
            isDone: false,
            isNext: currentState.assigneeId === roleId,
          },
        ];
      }

      return acc;
    },
    [],
  );

  return orderBy(
    upcomingTickets,
    ["isNext", "isDone", "isActive", "isPaused"],
    ["desc", "desc", "desc", "desc"],
  );
};

/**
 * based on the provided schedule item return the active state. If the
 * schedule item point to another state (the current one is DONE) it
 * will return the next one. If no work was done, the first active state will
 * be returned
 * @param ticketWorkflowStates
 * @param scheduleItem
 * @returns
 */
export const getTicketCurrentState = (
  ticketWorkflowStates: TicketWorkflowState[],
  scheduleItem?: ScheduleItem,
): TicketWorkflowState => {
  const twsById = keyBy(filter(ticketWorkflowStates, "isActive"), "id");

  if (scheduleItem) {
    if (scheduleItem.nextTicketWorkflowStateId) {
      return twsById[scheduleItem.nextTicketWorkflowStateId];
    } else {
      return twsById[scheduleItem.ticketWorkflowStateId];
    }
  } else {
    return ticketWorkflowStates[0];
  }
};

interface GetMyTicketsToEstimateArgs {
  roleId: number;
  organizationId: number;
  includeEstimated?: boolean;
}

export const getMyTicketsToEstimate = async ({
  roleId,
  organizationId,
  includeEstimated,
}: GetMyTicketsToEstimateArgs): Promise<Ticket[]> => {
  const where: Prisma.TicketWhereInput = {
    organizationId: organizationId,
    stage: ModelStage.PUBLISHED,
    status: TicketStatus.UNSCHEDULED,
    estimating: true,
    project: {
      stage: ModelStage.PUBLISHED,
      ancestorIsArchived: false,
    },
    ticketWorkflowStates: {
      some: {
        isActive: true,
        assigneeId: roleId,
      },
    },
  };

  if (!includeEstimated) {
    where.ticketWorkflowStates = {
      some: {
        isActive: true,
        assigneeId: roleId,
        OR: [
          { estimateMinimum: null },
          { estimateMaximum: null },
          { estimateMostLikely: null },
        ],
      },
    };
  }

  return prisma.ticket.findMany({
    where,
    include: {
      ticketWorkflowStates: {
        where: {
          isActive: true,
        },
      },
    },
  });
};

interface GetMyNextTicketsArgs {
  roleId: number;
  organizationId: number;
}

export const getMyNextTickets = async ({
  roleId,
  organizationId,
}: GetMyNextTicketsArgs): Promise<NextTicketShape[]> => {
  // find when we ran the last predictions (aka. estimate epoch)
  const lastestEstimate = await prisma.estimate.findFirst({
    where: {
      organizationId: organizationId,
    },
    orderBy: {
      epoch: "desc",
    },
  });

  if (lastestEstimate) {
    const estimates = await prisma.estimate.findMany({
      where: {
        organizationId: organizationId,
        assigneeId: roleId,
        epoch: lastestEstimate.epoch,
      },
      orderBy: {
        start_p80: "asc",
      },
    });

    const estimatesByStateId = keyBy(estimates, "id");
    // twsIds stands for Ticket Workflow State Ids (a mouthfull)
    const twsIds = map(estimates, "id");

    const tickets = await prisma.ticket.findMany({
      where: {
        organizationId: organizationId,
        status: TicketStatus.SCHEDULED,
        ticketWorkflowStates: {
          some: { id: { in: twsIds } },
        },
      },
      include: {
        author: true,
        product: true,
        workflow: true,
        ancestors: true,
        ticketWorkflowStates: {
          where: {
            isActive: true,
          },
          orderBy: { position: "asc" },
          include: {
            assignee: true,
          },
        },
        scheduleItems: {
          orderBy: { startedAt: "desc" },
          take: 1,
        },
      },
    });

    // we now have all the tickets where the current user is involved,
    // we check if the previous state is done
    const states = reduce(
      tickets,
      (acc: NextTicketShape[], ticket): NextTicketShape[] => {
        const lastItem = last(ticket.scheduleItems);
        const twsById = keyBy(ticket.ticketWorkflowStates, "id");

        // If there is a lastItem, it means that work on this ticket has started
        // We should make sure that the requested next step is a match
        if (lastItem) {
          // we are only interrested in tasks that finished (they have a next workflow specified)
          if (lastItem.nextTicketWorkflowStateId) {
            // we only want task where the next phase is supposed to be for US
            if (twsIds.indexOf(lastItem.nextTicketWorkflowStateId) > -1) {
              return [
                ...acc,
                {
                  ticket,
                  nextState: twsById[lastItem.nextTicketWorkflowStateId],
                },
              ];
            }
          } else if (lastItem.done) {
            // case where we re-schedule a ticket that has been stopped, the ticket
            // will have a last item without a nextTicketWorkflowStateId
            if (twsIds.indexOf(lastItem.ticketWorkflowStateId) > -1) {
              return [
                ...acc,
                {
                  ticket,
                  nextState: twsById[lastItem.ticketWorkflowStateId],
                },
              ];
            }
          }
          return acc;
        }

        // otherwise, this ticket has not been touched yet.
        // since we have not started working on this ticket, we should only
        // consider ticket where the first step has been assigned to the user
        // and aren't blocked by an ancestor
        const firstState = first(ticket.ticketWorkflowStates);
        if (firstState) {
          // was the first state not assigned to this user, we ignore this ticket
          if (twsIds.indexOf(firstState.id) === -1) {
            return acc;
          }
          // if this ticket has ancestors, we confirm they are all done
          for (const ancestor of ticket.ancestors) {
            // we should only consider ticket that are scheduled and ignore
            // blocking tickets that have been deleted, done, cancelled or in draft
            if (ancestor.status === TicketStatus.SCHEDULED) {
              return acc;
            }
          }
          return [
            ...acc,
            {
              ticket,
              nextState: ticket.ticketWorkflowStates[0],
            },
          ];
        }

        return acc;
      },
      [],
    );

    return sortBy(
      states,
      (state) => estimatesByStateId[state.nextState.id].start,
    );
  }

  return [];
};
/**
 * Decides if a state should trigger a notification for estimate to its assignee
 * @returns Boolean
 */
export const shouldNotifyAssignee = (tws: TicketWorkflowState): boolean => {
  return (
    !!tws.assigneeId && // should have an assignee
    tws.isActive && // should be an active state
    // should be missing at least one estimate
    (!tws.estimateMaximum || !tws.estimateMinimum || !tws.estimateMostLikely)
  );
};

interface GetPageForProjectArgs extends GetPageArgsFor<Ticket> {
  projectId: number;
  hideCompleted?: boolean;
  organizationId: number;
  roleId?: number;
}

export async function getPaginatedTicketsForProject(
  args: GetPageForProjectArgs,
) {
  const {
    cursor,
    first,
    hideCompleted,
    last,
    organizationId,
    projectId,
    roleId,
  } = args;

  // default offset to be at the start (or the end
  // depending on direction)
  const offset = cursor ? 1 : args.offset ? args.offset : 0;

  // by default sort on createdAt
  const sort: keyof Ticket = args.sort ? args.sort : "createdAt";

  // by default sort direction should be ascending
  const direction: Prisma.SortOrder = args.last
    ? Prisma.SortOrder.desc
    : Prisma.SortOrder.asc;

  // first (or last) X defines the number of item per page
  // the fallback is 10 if not provided
  const requestedPageSize = first || last || 10;
  const pageSize = clamp(requestedPageSize, 1, 50);

  // the default personalized ticket listing will display:
  // - unscheduled tickets
  // - scheduled tickets
  // - draft tickets authored by the individual
  const whereOR: Prisma.TicketWhereInput[] = [
    {
      stage: ModelStage.DRAFT,
      authorId: roleId,
    },
  ];

  if (hideCompleted) {
    whereOR.push({
      stage: ModelStage.PUBLISHED,
      status: { in: [TicketStatus.SCHEDULED, TicketStatus.UNSCHEDULED] },
    });
  } else {
    whereOR.push({
      stage: ModelStage.PUBLISHED,
    });
  }

  const ticketQuery: Prisma.TicketWhereInput = {
    organizationId,
    projectId,
    OR: whereOR,
  };

  const tickets = await prisma.ticket.findMany({
    where: ticketQuery,
    skip: offset,
    take: pageSize,
    orderBy: getTicketSorting(sort.toString(), direction),
    cursor: cursor ? { id: cursor } : undefined,
    include: {
      ticketWorkflowStates: {
        include: {
          assignee: true,
        },
      },
      scheduleItems: {
        include: {
          nextTicketWorkflowState: { include: { assignee: true } },
          ticketWorkflowState: true,
          role: true,
        },
        // we might have to use stoppedAt here but when null it should take
        // precendence (meaning the task is in progress)
        orderBy: { startedAt: "desc" },
        take: 1,
      },
      workflow: true,
      product: true,
      project: true,
    },
  });

  const count = await prisma.ticket.count({ where: ticketQuery });
  return paginateNodes({ nodes: tickets, offset, pageSize, count });
}

export async function isTicketBlocked(
  organizationId: number,
  ticketId: number,
): Promise<boolean> {
  const ticket = await prisma.ticket.findFirstOrThrow({
    where: {
      id: ticketId,
      organizationId,
    },
    include: {
      ticketWorkflowStates: {
        where: {
          isActive: true,
        },
      },
    },
  });

  return some(ticket.ticketWorkflowStates, "isBlocked");
}

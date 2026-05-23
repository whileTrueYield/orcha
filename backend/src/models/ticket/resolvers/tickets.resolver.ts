import { Arg, Query, Resolver, Int, UseMiddleware, Ctx } from "type-graphql";

import {
  Ticket,
  TicketStatus,
  ModelStage,
  TicketWorkflowState,
} from "@generated/type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import {
  getMyTicketsToEstimate,
  getPaginatedTickets,
  getPaginatedTicketsForProject,
  getTicketCurrentState,
} from "../helper";
import { PaginatedTickets, MyPreviousAssignedTicket } from "../entity";
import { last, reduce, trim } from "lodash";
import { Prisma, RoleStatus } from "@prisma/client";
import prisma from "../../../prisma";
import { subDays } from "date-fns";

@Resolver((_of) => Ticket)
export class TicketsResolver {
  @Query((_returns) => [Ticket], {
    description: "The user's own tickets and drafts",
  })
  @UseMiddleware(hasRole())
  async myTickets(@Ctx() ctx: AppContext<AuthRoleContext>): Promise<Ticket[]> {
    return ctx.prisma.ticket.findMany({
      where: {
        organizationId: ctx.me.organizationId,
        OR: [
          { ownerId: ctx.me.roleId, status: TicketStatus.UNSCHEDULED },
          {
            ownerId: null,
            authorId: ctx.me.roleId,
            stage: ModelStage.DRAFT,
          },
          {
            ownerId: ctx.me.roleId,
            stage: ModelStage.DRAFT,
          },
          {
            project: {
              OR: [
                { ancestorIsArchived: false },
                { stage: ModelStage.PUBLISHED },
              ],
            },
          },
        ],
      },
      include: {
        workflow: true,
        product: true,
        author: true,
        owner: true,
        ticketWorkflowStates: true,
      },
    });
  }

  @Query((_returns) => [TicketWorkflowState], {
    description: "scheduled tickets that cannot be estimated",
  })
  @UseMiddleware(hasRole())
  async blockingTickets(
    @Ctx() ctx: AppContext<AuthRoleContext>
  ): Promise<TicketWorkflowState[]> {
    return ctx.prisma.ticketWorkflowState.findMany({
      where: {
        ticket: {
          organizationId: ctx.me.organizationId,
          status: TicketStatus.SCHEDULED,
          stage: ModelStage.PUBLISHED,
        },
        assignee: {
          status: { not: RoleStatus.ACCEPTED },
        },
      },
      include: {
        assignee: true,
        ticket: {
          include: {
            workflow: true,
            product: true,
          },
        },
      },
    });
  }

  @Query((_returns) => [Ticket])
  @UseMiddleware(hasRole())
  async ticketsForMyCalendar(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("search", () => String, { nullable: true }) search?: string
  ): Promise<Ticket[]> {
    const ticketQuery: Prisma.TicketWhereInput = {
      organizationId: ctx.me.organizationId,
      stage: ModelStage.PUBLISHED,
      status: {
        in: [TicketStatus.CANCELLED, TicketStatus.SCHEDULED, TicketStatus.DONE],
      },
      ticketWorkflowStates: {
        some: {
          assigneeId: ctx.me.roleId,
        },
      },
    };

    ticketQuery.AND = [
      {
        OR: [
          { closedAt: { gte: subDays(new Date(), 30) } },
          { status: TicketStatus.SCHEDULED },
        ],
      },
    ];

    // We allow search on tickets by their description and title
    const query = trim(search);
    if (query) {
      const searchQuery: Prisma.TicketWhereInput = {};
      searchQuery.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ];

      // in case the search is the product code + the ticket ID
      const parts = /([a-z]+)[^\d]?(\d+)/gi.exec(query);
      if (parts) {
        const productCode = parts[1];
        const ticketLocalId = parts[2];

        searchQuery.OR.push({
          AND: [
            { localId: parseInt(ticketLocalId) },
            {
              product: { code: { contains: productCode, mode: "insensitive" } },
            },
          ],
        });
      }

      ticketQuery.AND.push(searchQuery);
    }

    return prisma.ticket.findMany({
      where: { ...ticketQuery },
      take: 20,
      orderBy: [{ closedAt: "desc" }, { scheduledAt: "desc" }],
      include: {
        product: true,
      },
    });
  }

  @Query((_returns) => PaginatedTickets)
  @UseMiddleware(hasRole())
  async tickets(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("first", () => Int, { nullable: true }) first?: number,
    @Arg("last", () => Int, { nullable: true }) last?: number,
    @Arg("offset", () => Int, { nullable: true }) offset?: number,
    @Arg("sort", () => String, { nullable: true }) sort?: keyof Ticket,
    @Arg("projectId", () => Int, { nullable: true }) projectId?: number,
    @Arg("recursive", () => Boolean, { nullable: true }) recursive?: boolean,
    @Arg("search", () => String, { nullable: true }) search?: string,
    @Arg("productId", () => Int, { nullable: true }) productId?: number,
    @Arg("productIds", () => [Int], { nullable: true }) productIds?: number[],
    @Arg("workflowIds", () => [Int], { nullable: true }) workflowIds?: number[],
    @Arg("authorIds", () => [Int], { nullable: true }) authorIds?: number[],
    @Arg("assigneeIds", () => [Int], { nullable: true }) assigneeIds?: number[],
    @Arg("featureIds", () => [Int], { nullable: true }) featureIds?: number[],
    @Arg("tagIds", () => [Int], { nullable: true }) tagIds?: number[],
    @Arg("isActive", () => Boolean, { nullable: true }) isActive?: boolean,
    @Arg("unassigned", () => Boolean, { nullable: true }) unassigned?: boolean,
    @Arg("isReadyToSchedule", () => Boolean, { nullable: true })
    isReadyToSchedule?: boolean,
    @Arg("unestimated", () => Boolean, { nullable: true })
    unestimated?: boolean,
    @Arg("untagged", () => Boolean, { nullable: true }) untagged?: boolean,
    @Arg("watched", () => Boolean, { nullable: true }) watched?: boolean,
    @Arg("unfinished", () => Boolean, { nullable: true }) unfinished?: boolean,
    @Arg("createdAtFilter", () => String, { nullable: true })
    createdAtFilter?: string,
    @Arg("etaFilter", () => String, { nullable: true })
    etaFilter?: string,
    @Arg("statuses", () => [TicketStatus], { nullable: true })
    statuses?: TicketStatus[],
    @Arg("stages", () => [ModelStage], { nullable: true })
    stages?: ModelStage[]
  ): Promise<PaginatedTickets> {
    return getPaginatedTickets({
      roleId: ctx.me.roleId,
      organizationId: ctx.me.organizationId,
      productId,
      // filter sections
      productIds,
      workflowIds,
      authorIds,
      featureIds,
      tagIds,
      assigneeIds,
      statuses,
      stages,
      projectId,
      recursive, // recursive search through sub-project from provided path
      // date filters
      createdAtFilter,
      etaFilter,
      // pagination
      first,
      last,
      offset,
      sort,
      search,
      isActive,
      untagged,
      watched,
      unfinished,
      unassigned,
      unestimated,
      isReadyToSchedule,
    });
  }

  @Query((_returns) => PaginatedTickets)
  @UseMiddleware(hasRole())
  async moreTickets(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("first", () => Int, { nullable: true }) first?: number,
    @Arg("last", () => Int, { nullable: true }) last?: number,
    @Arg("cursor", () => Int, { nullable: true }) cursor?: number,
    @Arg("sort", () => String, { nullable: true }) sort?: keyof Ticket,
    @Arg("projectId", () => Int, { nullable: true }) projectId?: number,
    @Arg("recursive", () => Boolean, { nullable: true }) recursive?: boolean,
    @Arg("search", () => String, { nullable: true }) search?: string,
    @Arg("productId", () => Int, { nullable: true }) productId?: number,
    @Arg("productIds", () => [Int], { nullable: true }) productIds?: number[],
    @Arg("workflowIds", () => [Int], { nullable: true }) workflowIds?: number[],
    @Arg("authorIds", () => [Int], { nullable: true }) authorIds?: number[],
    @Arg("ownerIds", () => [Int], { nullable: true }) ownerIds?: number[],
    @Arg("assigneeIds", () => [Int], { nullable: true }) assigneeIds?: number[],
    @Arg("featureIds", () => [Int], { nullable: true }) featureIds?: number[],
    @Arg("tagIds", () => [Int], { nullable: true }) tagIds?: number[],
    @Arg("intersectTagIds", () => [Int], { nullable: true })
    intersectTagIds?: number[],
    @Arg("hideCompleted", () => Boolean, { nullable: true })
    hideCompleted?: boolean,
    @Arg("isActive", () => Boolean, { nullable: true }) isActive?: boolean,
    @Arg("atRisk", () => Boolean, { nullable: true }) atRisk?: boolean,
    @Arg("unassigned", () => Boolean, { nullable: true }) unassigned?: boolean,
    @Arg("isReadyToSchedule", () => Boolean, { nullable: true })
    isReadyToSchedule?: boolean,
    @Arg("untagged", () => Boolean, { nullable: true }) untagged?: boolean,
    @Arg("unestimated", () => Boolean, { nullable: true })
    unestimated?: boolean,
    @Arg("allUntagged", () => Boolean, { nullable: true })
    allUntagged?: boolean,
    @Arg("createdAtFilter", () => String, { nullable: true })
    createdAtFilter?: string,
    @Arg("etaFilter", () => String, { nullable: true })
    etaFilter?: string,
    @Arg("closedAtFilter", () => String, { nullable: true })
    closedAtFilter?: string,
    @Arg("statuses", () => [TicketStatus], { nullable: true })
    statuses?: TicketStatus[],
    @Arg("stages", () => [ModelStage], { nullable: true })
    stages?: ModelStage[]
  ): Promise<PaginatedTickets> {
    return getPaginatedTickets({
      roleId: ctx.me.roleId,
      organizationId: ctx.me.organizationId,
      productId,
      // filter sections
      productIds,
      workflowIds,
      authorIds,
      ownerIds,
      featureIds,
      tagIds,
      intersectTagIds,
      assigneeIds,
      statuses,
      stages,
      projectId,
      recursive, // recursive search through sub-project from provided path
      // date filters
      createdAtFilter,
      etaFilter,
      closedAtFilter,
      // pagination
      first,
      last,
      cursor,
      sort,
      search,
      isActive,
      hideCompleted,
      untagged,
      allUntagged,
      atRisk,
      unassigned,
      isReadyToSchedule,
      unestimated,
      publishedProjectOnly: stages?.includes(ModelStage.ARCHIVED)
        ? false
        : true,
    });
  }

  @Query(() => [Ticket], {
    description: "estimated and not yet estimated ticket assigned to me",
  })
  @UseMiddleware(hasRole())
  async myTicketsToEstimate(
    @Ctx() ctx: AppContext<AuthRoleContext>
  ): Promise<Ticket[]> {
    return getMyTicketsToEstimate({
      roleId: ctx.me.roleId,
      organizationId: ctx.me.organizationId,
      includeEstimated: true,
    });
  }

  @Query((_returns) => PaginatedTickets)
  @UseMiddleware(hasRole())
  async myNotScheduledTickets(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("first", () => Int, { nullable: true }) first?: number,
    @Arg("sort", () => String, { nullable: true }) sort?: keyof Ticket,
    @Arg("last", () => Int, { nullable: true }) last?: number,
    @Arg("offset", () => Int, { nullable: true }) offset?: number
  ): Promise<PaginatedTickets> {
    return getPaginatedTickets({
      ownerId: ctx.me.roleId,
      organizationId: ctx.me.organizationId,
      statuses: [TicketStatus.UNSCHEDULED],
      stages: [ModelStage.PUBLISHED],
      publishedProjectOnly: true,
      first,
      last,
      offset,
      sort,
    });
  }

  @Query((_returns) => [Ticket])
  @UseMiddleware(hasRole())
  async myWatchedTickets(
    @Ctx() ctx: AppContext<AuthRoleContext>
  ): Promise<Ticket[]> {
    return ctx.prisma.ticket.findMany({
      where: {
        organizationId: ctx.me.organizationId,
        watchers: { some: { id: ctx.me.roleId } },
        OR: [
          {
            stage: ModelStage.PUBLISHED,
            status: { in: [TicketStatus.SCHEDULED, TicketStatus.UNSCHEDULED] },
          },
          { stage: ModelStage.DRAFT },
          {
            project: {
              stage: ModelStage.PUBLISHED,
              ancestorIsArchived: false,
            },
          },
        ],
      },
      include: {
        product: true,
        workflow: true,
        ticketWorkflowStates: {
          include: {
            assignee: true,
          },
        },
        author: true,
      },
    });
  }

  @Query((_returns) => PaginatedTickets)
  @UseMiddleware(hasRole())
  async myRecentlyCreatedTickets(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("projectId", () => Int, { nullable: true }) projectId?: number,
    @Arg("first", () => Int, { nullable: true }) first?: number,
    @Arg("last", () => Int, { nullable: true }) last?: number,
    @Arg("offset", () => Int, { nullable: true }) offset?: number,
    @Arg("sort", () => String, { nullable: true }) sort?: keyof Ticket
  ): Promise<PaginatedTickets> {
    return getPaginatedTickets({
      organizationId: ctx.me.organizationId,
      authorId: ctx.me.roleId,
      stages: [ModelStage.DRAFT, ModelStage.PUBLISHED],
      first,
      last,
      offset,
      sort: sort || "createdAt",
      projectId,
      recentlyCreated: true,
      publishedProjectOnly: true,
    });
  }

  @Query((_returns) => [Ticket])
  @UseMiddleware(hasRole())
  async myEstimatedTickets(
    @Ctx() ctx: AppContext<AuthRoleContext>
  ): Promise<Ticket[]> {
    const tickets = await ctx.prisma.ticket.findMany({
      where: {
        organizationId: ctx.me.organizationId,
        authorId: ctx.me.roleId,
        stage: ModelStage.PUBLISHED,
        status: TicketStatus.UNSCHEDULED,
        ticketWorkflowStates: {
          every: {
            OR: [
              {
                estimateMinimum: { not: null },
                estimateMostLikely: { not: null },
                estimateMaximum: { not: null },
                isActive: true,
              },
              { isActive: false },
            ],
          },
        },
      },
      include: {
        product: true,
        workflow: true,
      },
    });

    return tickets;
  }

  @Query((_returns) => [Ticket])
  @UseMiddleware(hasRole())
  async myUnestimatedTickets(
    @Ctx() ctx: AppContext<AuthRoleContext>
  ): Promise<Ticket[]> {
    const tickets = await ctx.prisma.ticket.findMany({
      where: {
        organizationId: ctx.me.organizationId,
        authorId: ctx.me.roleId,
        stage: ModelStage.PUBLISHED,
        status: TicketStatus.UNSCHEDULED,
        ticketWorkflowStates: {
          some: {
            estimateMinimum: null,
            estimateMostLikely: null,
            estimateMaximum: null,
            isActive: true,
          },
        },
      },
      include: {
        product: true,
        workflow: true,
      },
    });

    return tickets;
  }

  @Query((_returns) => [MyPreviousAssignedTicket])
  @UseMiddleware(hasRole())
  async myPreviousTickets(
    @Ctx() ctx: AppContext<AuthRoleContext>
  ): Promise<MyPreviousAssignedTicket[]> {
    // grab all the tickets the current user is planned to work on
    const tickets = await prisma.ticket.findMany({
      where: {
        organizationId: ctx.me.organizationId,
        stage: ModelStage.PUBLISHED,
        scheduleItems: {
          some: {
            roleId: { in: [ctx.me.roleId] },
          },
        },
        OR: [
          {
            status: TicketStatus.SCHEDULED,
          },
          {
            // we also want to display tickets closed within the past 2 weeks
            status: TicketStatus.DONE,
            closedAt: { gt: subDays(new Date(), 14) },
          },
        ],
      },
      include: {
        product: true,
        author: true,
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

    // we now have all the tickets where the current user was
    // involved in a previous state
    return reduce(
      tickets,
      (acc: MyPreviousAssignedTicket[], ticket): MyPreviousAssignedTicket[] => {
        const lastItem = last(ticket.scheduleItems);

        if (ticket.status === TicketStatus.DONE) {
          return [
            ...acc,
            {
              ticket,
              currentState: null,
              lastState: lastItem ? lastItem.ticketWorkflowState : null,
              isStarted: true,
              isActive: false,
              isPaused: false,
              isDone: false,
              isNext: false,
            },
          ];
        }

        if (lastItem) {
          const currentState = getTicketCurrentState(
            ticket.ticketWorkflowStates,
            lastItem
          );

          const isDone = !!lastItem.nextTicketWorkflowStateId;
          const isPaused = !isDone && !!lastItem.stoppedAt;
          const isActive = !isPaused && !lastItem.stoppedAt;

          return [
            ...acc,
            {
              ticket,
              currentState,
              lastState: lastItem.ticketWorkflowState,
              isStarted: true,
              isActive,
              isPaused,
              isDone,
              isNext: currentState.assigneeId === ctx.me.roleId,
            },
          ];
        }

        return acc;
      },
      []
    );
  }

  @Query((_returns) => PaginatedTickets)
  @UseMiddleware(hasRole())
  async moreTicketsForProject(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("projectId", () => Int) projectId: number,
    @Arg("first", () => Int, { nullable: true }) first?: number,
    @Arg("last", () => Int, { nullable: true }) last?: number,
    @Arg("cursor", () => Int, { nullable: true }) cursor?: number,
    @Arg("sort", () => String, { nullable: true }) sort?: keyof Ticket,
    @Arg("hideCompleted", () => Boolean, { nullable: true })
    hideCompleted?: boolean
  ): Promise<PaginatedTickets> {
    return getPaginatedTicketsForProject({
      roleId: ctx.me.roleId,
      organizationId: ctx.me.organizationId,
      hideCompleted,
      projectId,
      first,
      last,
      cursor,
      sort,
    });
  }
}

import { UserInputError } from "apollo-server-express";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import {
  Arg,
  Ctx,
  Int,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import {
  Ticket,
  TicketStatus,
  ModelStage,
  TicketWorkflowState,
} from "@generated/type-graphql";
import { requestEstimate } from "../jobs/estimateTickets";
import { difference, filter, intersection, map, uniq } from "lodash";

export const assertCanScheduleTicket = (
  ticket: Ticket,
  ticketWorkflowStates: TicketWorkflowState[]
): void => {
  if (ticket.status === TicketStatus.SCHEDULED) {
    throw new UserInputError(`This ticket is already scheduled`);
  }

  const activeStates = filter(ticketWorkflowStates, "isActive");

  if (activeStates.length === 0) {
    throw new UserInputError(
      `Scheduling requires at least one state to be active`
    );
  }

  for (const state of activeStates) {
    if (!state.assigneeId) {
      throw new UserInputError(`Every active state needs to be assigned`);
    }
    if (
      !state.estimateMinimum ||
      !state.estimateMostLikely ||
      !state.estimateMaximum
    ) {
      throw new UserInputError(`Every active state needs have an estimate`);
    }
  }
};

@Resolver(Ticket)
export class ScheduleTicketResolver {
  @Mutation(() => Ticket)
  @UseMiddleware(hasRole())
  async scheduleTicket(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("ticketId", () => Int) ticketId: number
  ): Promise<Ticket> {
    const ticket = await ctx.prisma.ticket.findFirstOrThrow({
      where: {
        id: ticketId,
        organizationId: ctx.me.organizationId,
        stage: { not: ModelStage.DELETED },
      },
      include: { ticketWorkflowStates: { where: { isActive: true } } },
    });

    assertCanScheduleTicket(ticket, ticket.ticketWorkflowStates);

    // update the ticket status to a "scheduled" state
    const updatedTicket = await ctx.prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        status: TicketStatus.SCHEDULED,
        scheduledAt: new Date(),
      },
    });

    await requestEstimate(ctx.me.organizationId);

    return updatedTicket;
  }

  @Query(() => [Ticket])
  @UseMiddleware(hasRole())
  async getUnscheduledDependencies(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("ticketIds", () => [Int]) ticketIds: number[]
  ): Promise<Ticket[]> {
    return ctx.prisma.ticket.findMany({
      where: {
        successors: {
          some: { id: { in: ticketIds } },
        },
        organizationId: ctx.me.organizationId,
        stage: ModelStage.PUBLISHED,
        status: TicketStatus.UNSCHEDULED,
      },
      include: {
        product: true,
        workflow: true,
        ancestors: true,
      },
    });
  }

  /**
   * This provides all the dependencies and their grand-children
   * it stops as soon as
   * @param ctx
   * @param ticketIds
   * @returns
   */
  @Query(() => [Ticket])
  @UseMiddleware(hasRole())
  async getAllUnscheduledDependencies(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("ticketIds", () => [Int]) ticketIds: number[]
  ): Promise<Ticket[]> {
    if (ticketIds.length === 0) {
      return [];
    }

    // for performance sake, we'll capture all the ticket that aren't scheduled with a minimal
    // data set
    const allTickets = await ctx.prisma.ticket.findMany({
      where: {
        organizationId: ctx.me.organizationId,
        successors: { some: {} }, // only tickets with a successor
        status: TicketStatus.UNSCHEDULED,
        stage: ModelStage.PUBLISHED,
      },
      select: {
        id: true,
        successors: {
          select: {
            id: true,
          },
        },
      },
    });

    let dependencyIds: number[] = ticketIds;
    let dependencies: Ticket[] = [];
    let max_iteration = 1000;

    // tickets we need to find dependencies for, this list
    // evolves
    let dependencyForTicketIds: number[] = ticketIds;
    while (max_iteration > 0) {
      dependencies = filter(
        allTickets,
        (ticket) =>
          intersection(map(ticket.successors, "id"), dependencyForTicketIds)
            .length > 0
      ) as Ticket[];

      if (dependencies.length) {
        // for the next loopm, we store the ID of the ticket for which we'll look for ancestors
        dependencyForTicketIds = map(dependencies, "id");
        dependencyIds = uniq([...dependencyIds, ...dependencyForTicketIds]);
      } else {
        // there is no more dependencies to look for
        break;
      }

      max_iteration = max_iteration - 1;
    }

    return ctx.prisma.ticket.findMany({
      where: {
        organizationId: ctx.me.organizationId,
        stage: ModelStage.PUBLISHED,
        status: TicketStatus.UNSCHEDULED,
        id: { in: difference(dependencyIds, ticketIds) },
      },
      include: {
        product: true,
        ticketWorkflowStates: true,
      },
    });
  }
}

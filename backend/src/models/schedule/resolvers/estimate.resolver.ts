import { Query, Resolver, UseMiddleware, Ctx, Arg } from "type-graphql";
import { Estimate } from "@generated/type-graphql";
import { AppContext, AuthRoleContext } from "../../../types";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { ScheduleEstimate, ScheduleRole } from "../entity";
import { Prisma, RoleStatus } from "@prisma/client";
import { keyBy, map, round, uniq } from "lodash";
import { EMPTY_WORK_WEEK } from "../../entities";
import { getAvailableWorkHoursAt } from "../helper";
import { UserInputError } from "apollo-server-express";

@Resolver(Estimate)
export class EstimateResolver {
  @Query((_returns) => [ScheduleRole])
  @UseMiddleware(hasRole())
  async getScheduleRoles(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("fromDate", () => Date) fromDate: Date,
    @Arg("toDate", () => Date) toDate: Date
  ): Promise<ScheduleRole[]> {
    const now = new Date();

    if (fromDate > now) {
      throw new UserInputError(
        "lower boundary date (fromDate) should be in the past"
      );
    }

    if (toDate < now) {
      throw new UserInputError(
        "upper boundary date (toDate) should be in the future"
      );
    }

    const roles = await ctx.prisma.role.findMany({
      where: {
        organizationId: ctx.me.organizationId,
        status: RoleStatus.ACCEPTED,
      },
    });

    return map(roles, (role) => {
      const workWeek = { ...EMPTY_WORK_WEEK, ...JSON.parse(role.workWeek) };
      const pastCapacity = getAvailableWorkHoursAt(
        workWeek,
        role.timeZone,
        fromDate,
        now
      );

      const futureCapacity = getAvailableWorkHoursAt(
        workWeek,
        role.timeZone,
        now,
        toDate
      );

      return {
        id: role.id,
        name: role.name,
        title: role.title,
        avatarUrl: role.avatarUrl,
        pastCapacity: round(pastCapacity, 2),
        futureCapacity: round(futureCapacity, 2),
      };
    });
  }

  @Query((_returns) => [Estimate])
  @UseMiddleware(hasRole([]))
  async getAllEstimates(
    @Ctx() ctx: AppContext<AuthRoleContext>
  ): Promise<Estimate[]> {
    const lastEpoch = await ctx.prisma.estimate.findFirst({
      where: {
        type: "TicketWorkflowState",
        organizationId: ctx.me.organizationId,
      },
      take: 1,
      orderBy: { epoch: "desc" },
    });

    if (lastEpoch) {
      return ctx.prisma.estimate.findMany({
        where: {
          organizationId: ctx.me.organizationId,
          type: "TicketWorkflowState",
          epoch: lastEpoch.epoch,
        },
      });
    }

    return [];
  }

  @Query((_returns) => [ScheduleEstimate])
  @UseMiddleware(hasRole())
  async getEstimates(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("toDate", () => Date) toDate: Date
  ): Promise<ScheduleEstimate[]> {
    const upperLimit = round(toDate.getTime() / 1000);

    // first we'll find the latest estimate
    const estimates = await ctx.prisma.$queryRaw<Estimate[]>(Prisma.sql`
      SELECT *
      FROM "Estimate"
      WHERE
        "organizationId" = ${ctx.me.organizationId} AND
        epoch = (
          SELECT epoch 
          FROM "Estimate" 
          WHERE "organizationId" = ${ctx.me.organizationId} 
          ORDER BY epoch DESC 
          LIMIT 1) AND
        start < ${upperLimit}
      ORDER BY start ASC
    `);

    const ticketWorkflowStateIds = uniq(map(estimates, "id"));

    const ticketWorkflowStates = await ctx.prisma.ticketWorkflowState.findMany({
      where: {
        id: { in: ticketWorkflowStateIds },
      },
    });

    const ticketWorkflowStateById = keyBy(ticketWorkflowStates, "id");

    const tickets = await ctx.prisma.ticket.findMany({
      where: {
        id: { in: uniq(map(ticketWorkflowStates, "ticketId")) },
      },
      include: {
        product: true,
      },
    });

    const ticketById = keyBy(tickets, "id");

    return estimates.map((estimate) => {
      const state = ticketWorkflowStateById[estimate.id];
      const ticket = ticketById[state.ticketId];
      const ticketId = state.ticketId;

      return {
        roleId: estimate.assigneeId,
        ticketId,
        ticketTitle: ticket.title,
        ticketLocalId: ticket.localId || 0,
        ticketProductCode: ticket.product?.code || "n/a",
        ticketWorkflowStateName: state.name,
        ticketWorkflowStateId: state.id,
        startEpoch: estimate.start_p80,
        stopEpoch: estimate.end_p80,
        start_min: estimate.start_min,
        duration:
          (state.estimateMinimum! +
            state.estimateMaximum! +
            state.estimateMostLikely! * 4) /
          6,
      };
    });
  }
}

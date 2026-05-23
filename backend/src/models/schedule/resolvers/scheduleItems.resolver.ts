import { Arg, Query, Resolver, Int, UseMiddleware, Ctx } from "type-graphql";
import {
  ScheduleItem,
  RoleType,
  TicketStatus,
  ModelStage,
} from "@generated/type-graphql";
import { AppContext, AuthRoleContext } from "../../../types";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { PaginatedScheduleItems } from "../entity";
import { getPaginatedScheduleItems } from "../helper";
import { Prisma } from "@prisma/client";

@Resolver(ScheduleItem)
export class ScheduleItemsResolver {
  @Query((_returns) => PaginatedScheduleItems)
  @UseMiddleware(hasRole([RoleType.OWNER, RoleType.ADMIN]))
  async scheduleItems(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("roleId", () => Int, { nullable: true }) roleId: number,
    @Arg("first", () => Int, { nullable: true }) first: number,
    @Arg("last", () => Int, { nullable: true }) last: number,
    @Arg("offset", () => Int, { nullable: true }) offset: number,
    @Arg("sort", () => String, { nullable: true }) sort: keyof ScheduleItem,
    @Arg("search", () => String, { nullable: true }) search: string
  ): Promise<PaginatedScheduleItems> {
    return getPaginatedScheduleItems({
      organizationId: ctx.me.organizationId,
      roleId,
      first,
      last,
      offset,
      sort,
      search,
    });
  }

  @Query((_returns) => [ScheduleItem])
  @UseMiddleware(hasRole())
  async scheduleItemPeriod(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("fromDate", () => Date) fromDate: Date,
    @Arg("toDate", () => Date, { nullable: true }) toDate: Date | null,
    @Arg("roleId", () => Int, { nullable: true }) roleId: number | null
  ): Promise<ScheduleItem[]> {
    const where: Prisma.ScheduleItemWhereInput = {
      organizationId: ctx.me.organizationId,
    };

    if (roleId) {
      where.roleId = roleId;
    }

    if (!toDate) {
      where.startedAt = { gte: fromDate };
    } else if (toDate > new Date()) {
      where.OR = [
        { startedAt: { lt: toDate }, stoppedAt: { gt: fromDate } },
        { startedAt: { lt: toDate }, stoppedAt: null },
      ];
    } else {
      where.startedAt = { lt: toDate };
      where.stoppedAt = { gt: fromDate };
    }

    return ctx.prisma.scheduleItem.findMany({
      where,
      include: {
        ticketWorkflowState: true,
        ticket: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  @Query((_returns) => [ScheduleItem])
  @UseMiddleware(hasRole())
  async myScheduleItemPeriod(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("fromDate", () => Date) fromDate: Date,
    @Arg("toDate", () => Date) toDate: Date
  ): Promise<ScheduleItem[]> {
    const where: Prisma.ScheduleItemWhereInput = {
      organizationId: ctx.me.organizationId,
      roleId: ctx.me.roleId,
    };

    if (toDate > new Date()) {
      where.OR = [
        { startedAt: { lt: toDate }, stoppedAt: { gt: fromDate } },
        { startedAt: { lt: toDate }, stoppedAt: null },
      ];
    } else {
      where.startedAt = { lt: toDate };
      where.stoppedAt = { gt: fromDate };
    }

    return ctx.prisma.scheduleItem.findMany({
      where,
      include: {
        ticketWorkflowState: true,
        ticket: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  @Query((_returns) => [ScheduleItem])
  @UseMiddleware(hasRole())
  async myOpenScheduleItems(
    @Ctx() ctx: AppContext<AuthRoleContext>
  ): Promise<ScheduleItem[]> {
    return ctx.prisma.scheduleItem.findMany({
      where: {
        organizationId: ctx.me.organizationId,
        roleId: ctx.me.roleId,
        stoppedAt: null,
      },
      include: {
        ticketWorkflowState: true,
        ticket: {
          include: {
            workflow: true,
            product: true,
            ticketWorkflowStates: true,
          },
        },
      },
    });
  }

  @Query(() => [ScheduleItem])
  @UseMiddleware(hasRole())
  async myUnfinishedScheduleItems(
    @Ctx() ctx: AppContext<AuthRoleContext>
  ): Promise<ScheduleItem[]> {
    // Capture the last schedule item on every open task
    // of the organization
    const items = await ctx.prisma.scheduleItem.findMany({
      where: {
        organizationId: ctx.me.organizationId,
        ticket: {
          status: TicketStatus.SCHEDULED,
          stage: ModelStage.PUBLISHED,
          ticketWorkflowStates: {
            some: { assigneeId: ctx.me.roleId },
          },
        },
      },
      include: {
        ticket: {
          include: {
            product: true,
            workflow: true,
            ticketWorkflowStates: true,
          },
        },
        ticketWorkflowState: true,
      },
      orderBy: { stoppedAt: "desc" },
      distinct: ["ticketId"],
    });

    // only return the last item if the stoppedAt has been set on it
    // and it is not done
    return items.filter(
      (item) =>
        ctx.me.roleId === item.ticketWorkflowState.assigneeId &&
        item.stoppedAt &&
        !item.done
    );
  }
}

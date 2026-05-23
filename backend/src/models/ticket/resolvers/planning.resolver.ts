import { TicketStatus, ModelStage, Ticket } from "@generated/type-graphql";
import { addMonths } from "date-fns";
import { isEmpty, keyBy, last, map } from "lodash";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Int,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import { UpdateScheduleConfig } from "../../schedule/resolvers/ScheduleConfig.resolver";
import { PaginatedTickets, PlanningTicket } from "../entity";
import { getPaginatedTickets } from "../helper";
import {
  buildUid,
  estimateTickets,
  requestEstimate,
} from "../jobs/estimateTickets";
import { assertCanScheduleTicket } from "./scheduleTicket.resolver";

@InputType()
class ScheduleItemForEstimateObjInput {
  @Field()
  id: number;
}

@InputType()
class ScheduleConfigForEstimateInput {
  @Field()
  priority: number;

  @Field(() => [ScheduleItemForEstimateObjInput])
  tags: ScheduleItemForEstimateObjInput[];

  @Field(() => [ScheduleItemForEstimateObjInput])
  features: ScheduleItemForEstimateObjInput[];

  @Field(() => [ScheduleItemForEstimateObjInput])
  projects: ScheduleItemForEstimateObjInput[];

  @Field(() => [ScheduleItemForEstimateObjInput])
  products: ScheduleItemForEstimateObjInput[];

  @Field(() => [ScheduleItemForEstimateObjInput])
  workflows: ScheduleItemForEstimateObjInput[];

  @Field(() => [ScheduleItemForEstimateObjInput])
  tickets: ScheduleItemForEstimateObjInput[];
}

@Resolver((_of) => PlanningTicket)
export class PlanningResolver {
  @Query((_returns) => [PlanningTicket])
  @UseMiddleware(hasRole())
  async planningTickets(
    @Ctx() ctx: AppContext<AuthRoleContext>
  ): Promise<PlanningTicket[]> {
    const tickets = await ctx.prisma.ticket.findMany({
      where: {
        organizationId: ctx.me.organizationId,
        stage: ModelStage.PUBLISHED,
        status: { in: [TicketStatus.SCHEDULED] },
        eta: { not: null, lt: addMonths(new Date(), 6) },
        localId: { not: null },
      },
      include: {
        product: {
          select: {
            code: true,
            name: true,
          },
        },
        workflow: {
          select: {
            name: true,
          },
        },
        project: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        eta: "asc",
      },
    });

    return tickets.map(
      (ticket): PlanningTicket => ({
        id: ticket.id,
        title: ticket.title,
        status: ticket.status,
        productCode: ticket.product?.code || "N/A",
        // localId and eta are asserted in the query
        localId: ticket.localId!,
        eta: ticket.eta!,
        milestone: ticket.milestone,
        workflowName: ticket.workflow?.name || "N/A",
        productName: ticket.product?.name || "N/A",
        projectName: ticket.project?.name || "N/A",
      })
    );
  }

  @Query((_returns) => [PlanningTicket])
  @UseMiddleware(hasRole())
  async planningDeliveredTickets(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("fromDate", () => Date) fromDate: Date,
    @Arg("toDate", () => Date) toDate: Date
  ): Promise<PlanningTicket[]> {
    const tickets = await ctx.prisma.ticket.findMany({
      where: {
        organizationId: ctx.me.organizationId,
        stage: ModelStage.PUBLISHED,
        status: { in: [TicketStatus.CANCELLED, TicketStatus.DONE] },
        localId: { not: null },
        closedAt: { gte: fromDate, lte: toDate },
      },
      include: {
        product: {
          select: {
            code: true,
            name: true,
          },
        },
        workflow: {
          select: {
            name: true,
          },
        },
        project: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        eta: "asc",
      },
    });

    return tickets.map(
      (ticket): PlanningTicket => ({
        id: ticket.id,
        title: ticket.title,
        status: ticket.status,
        productCode: ticket.product?.code || "N/A",
        // localId and eta are asserted in the query
        localId: ticket.localId!,
        eta: ticket.closedAt!,
        milestone: ticket.milestone,
        workflowName: ticket.workflow?.name || "N/A",
        productName: ticket.product?.name || "N/A",
        projectName: ticket.project?.name || "N/A",
      })
    );
  }

  @Mutation(() => Boolean)
  @UseMiddleware(hasRole())
  async commitScheduleChanges(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("removeTicketIds", () => [Int], { nullable: "items" })
    removeTicketIds: number[],
    @Arg("addTicketIds", () => [Int], { nullable: "items" })
    addTicketIds: number[],
    @Arg("scheduleConfigs", () => [UpdateScheduleConfig], { nullable: "items" })
    scheduleConfigs: UpdateScheduleConfig[]
  ): Promise<boolean> {
    const ticketsToUnschedule = await ctx.prisma.ticket.findMany({
      where: {
        organizationId: ctx.me.organizationId,
        stage: ModelStage.PUBLISHED,
        status: TicketStatus.SCHEDULED,
        id: { in: removeTicketIds },
      },
      include: {
        workflow: true,
        product: true,
        project: true,
      },
    });

    const ticketsToSchedule = await ctx.prisma.ticket.findMany({
      where: {
        organizationId: ctx.me.organizationId,
        id: { in: addTicketIds },
      },
      include: { ticketWorkflowStates: { where: { isActive: true } } },
    });

    // make sure all the selected ticket can be scheduled before
    // doing any changes
    for (const ticket of ticketsToSchedule) {
      assertCanScheduleTicket(ticket, ticket.ticketWorkflowStates);
    }

    const now = new Date();

    // We schedule all the ticket that can be scheduled.
    await ctx.prisma.ticket.updateMany({
      where: { id: { in: addTicketIds } },
      data: {
        status: TicketStatus.SCHEDULED,
        scheduledAt: now,
      },
    });

    // ...And unschedule all the tickets to be unscheduled
    await ctx.prisma.ticket.updateMany({
      where: { id: { in: map(ticketsToUnschedule, "id") } },
      data: {
        status: TicketStatus.UNSCHEDULED,
        scheduledAt: null,
      },
    });

    // and close all work that haven't been finished on them
    await ctx.prisma.scheduleItem.updateMany({
      where: {
        ticketId: { in: map(ticketsToUnschedule, "id") },
        stoppedAt: null,
      },
      data: {
        done: true,
        stoppedAt: now,
      },
    });

    // Set schedule config
    // We're starting by deleting any old schedule config
    await ctx.prisma.scheduleConfig.deleteMany({
      where: { organizationId: ctx.me.organizationId },
    });

    for (const filter of scheduleConfigs) {
      // Verify that all the objects referred to are part of
      // the user's organization
      const products = await ctx.prisma.product.findMany({
        where: {
          organizationId: ctx.me.organizationId,
          id: { in: filter.productIds },
        },
      });

      const projects = await ctx.prisma.project.findMany({
        where: {
          organizationId: ctx.me.organizationId,
          id: { in: filter.projectIds },
        },
      });

      const tags = await ctx.prisma.tag.findMany({
        where: {
          organizationId: ctx.me.organizationId,
          id: { in: filter.tagIds },
        },
      });

      const workflows = await ctx.prisma.workflow.findMany({
        where: {
          organizationId: ctx.me.organizationId,
          id: { in: filter.workflowIds },
        },
      });

      const tickets = await ctx.prisma.ticket.findMany({
        where: {
          organizationId: ctx.me.organizationId,
          id: { in: filter.ticketIds },
        },
      });

      if (
        isEmpty(products) &&
        isEmpty(tags) &&
        isEmpty(tickets) &&
        isEmpty(workflows) &&
        isEmpty(projects)
      ) {
        continue;
      }

      await ctx.prisma.scheduleConfig.create({
        data: {
          organizationId: ctx.me.organizationId,
          priority: filter.priority,
          products: {
            connect: products.map(({ id }) => ({ id })),
          },
          tags: { connect: tags.map(({ id }) => ({ id })) },
          tickets: { connect: tickets.map(({ id }) => ({ id })) },
          projects: { connect: projects.map(({ id }) => ({ id })) },
          workflows: { connect: workflows.map(({ id }) => ({ id })) },
        },
      });
    }

    await requestEstimate(ctx.me.organizationId, true);

    return true;
  }

  @Query((_returns) => PaginatedTickets)
  @UseMiddleware(hasRole())
  async getUnscheduledTickets(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("last", () => Int, { nullable: true }) last: number,
    @Arg("first", () => Int, { nullable: true }) first: number,
    @Arg("offset", () => Int, { nullable: true }) offset: number,
    @Arg("sort", () => String, { nullable: true }) sort: keyof Ticket,
    @Arg("search", () => String, { nullable: true }) search: string,
    @Arg("productId", () => Int, { nullable: true }) productId: number,
    @Arg("workflowId", () => Int, { nullable: true }) workflowId: number,
    @Arg("tagId", () => Int, { nullable: true }) tagId: number,
    @Arg("projectId", () => Int, { nullable: true }) projectId: number,
    @Arg("isReadyToSchedule", () => Boolean, { nullable: true })
    isReadyToSchedule: boolean
  ): Promise<PaginatedTickets> {
    return getPaginatedTickets({
      roleId: ctx.me.roleId,
      organizationId: ctx.me.organizationId,
      stages: [ModelStage.PUBLISHED],
      statuses: [TicketStatus.UNSCHEDULED],
      first,
      last,
      offset,
      sort,
      search,
      productId,
      workflowId,
      tagId,
      isReadyToSchedule,
      projectId,
      recursive: true,
      publishedProjectOnly: true,
    });
  }

  @Query((_returns) => [Ticket])
  @UseMiddleware(hasRole())
  async getScheduledTickets(
    @Ctx() ctx: AppContext<AuthRoleContext>
  ): Promise<Ticket[]> {
    return ctx.prisma.ticket.findMany({
      where: {
        organizationId: ctx.me.organizationId,
        stage: ModelStage.PUBLISHED,
        status: TicketStatus.SCHEDULED,
      },
      include: {
        workflow: true,
        product: true,
        project: true,
        tags: true,
        ticketWorkflowStates: {
          include: {
            assignee: true,
          },
        },
      },
    });
  }

  @Query((_returns) => [PlanningTicket])
  @UseMiddleware(hasRole())
  async planningProjection(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("ticketIds", () => [Int]) ticketIds: number[],
    @Arg("scheduleConfigs", () => [ScheduleConfigForEstimateInput], {
      nullable: "items",
    })
    scheduleConfigs: ScheduleConfigForEstimateInput[]
  ): Promise<PlanningTicket[]> {
    const scheduledTickets = await ctx.prisma.ticket.findMany({
      where: {
        organizationId: ctx.me.organizationId,
        stage: ModelStage.PUBLISHED,
        id: { in: ticketIds },
        // exclude ticket with non active assignnee
        ticketWorkflowStates: {
          none: {
            isActive: true,
            assignee: {
              status: { not: "ACCEPTED" },
            },
          },
        },
      },
      include: {
        product: true,
        workflow: true,
        project: true,
        scheduleItems: {
          // capture only the most recent schedule item
          orderBy: { stoppedAt: "desc" },
          take: 1,
          include: {
            ticketWorkflowState: true,
            nextTicketWorkflowState: true,
          },
        },
        ticketWorkflowStates: {
          where: { isActive: true },
          orderBy: { position: "asc" },
        },
        ancestors: {
          include: {
            ticketWorkflowStates: {
              where: { isActive: true },
              orderBy: { position: "asc" },
            },
          },
        },
      },
    });

    const snapshots = keyBy(
      await estimateTickets(
        ctx.me.organizationId,
        scheduledTickets,
        scheduleConfigs,
        true
      ),
      "uid"
    );

    // now that we have the snapshot, we need to attach the latest snapshot
    // to the tickets and return this information
    const planningTickets: PlanningTicket[] = [];

    for (const ticket of scheduledTickets) {
      const lastState = last(ticket.ticketWorkflowStates);
      if (lastState) {
        const uid = buildUid("TicketWorkflowState", lastState.id);

        planningTickets.push({
          id: ticket.id,
          title: ticket.title,
          status: ticket.status,
          localId: ticket.localId || 0,
          // estimates are provided in seconds, not millisecond
          eta: new Date(snapshots[uid].end_p80 * 1000),
          milestone: ticket.milestone,
          workflowName: ticket.workflow?.name || "n/a",
          productCode: ticket.product?.code || "n/a",
          productName: ticket.product?.name || "n/a",
          projectName: ticket.project?.name || "n/a",
        });
      }
    }

    return planningTickets;
  }
}

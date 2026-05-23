import { Query, Resolver, UseMiddleware, Ctx } from "type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import {
  RoleType,
  TicketStatus,
  ModelStage,
  Ticket,
  Role,
} from "@generated/type-graphql";
import { AppContext, AuthRoleContext } from "../../../types";
import { RoleStatus } from "@prisma/client";

@Resolver()
export class SwimlaneResolver {
  @Query((_returns) => [Role])
  @UseMiddleware(hasRole([]))
  async getAllRoles(@Ctx() ctx: AppContext<AuthRoleContext>): Promise<Role[]> {
    return ctx.prisma.role.findMany({
      where: {
        organizationId: ctx.me.organizationId,
        status: RoleStatus.ACCEPTED,
      },
      orderBy: { name: "asc" },
    });
  }

  @Query((_returns) => [Ticket])
  @UseMiddleware(hasRole([RoleType.OWNER, RoleType.ADMIN]))
  async getAllScheduledTasks(
    @Ctx() ctx: AppContext<AuthRoleContext>
  ): Promise<Ticket[]> {
    return ctx.prisma.ticket.findMany({
      where: {
        organizationId: ctx.me.organizationId,
        stage: ModelStage.PUBLISHED,
        status: TicketStatus.SCHEDULED,
      },
      include: {
        scheduleItems: {
          take: 1,
          orderBy: { stoppedAt: "desc" },
          include: {
            ticketWorkflowState: {
              include: {
                assignee: true,
              },
            },
            nextTicketWorkflowState: {
              include: {
                assignee: true,
              },
            },
            role: true,
          },
        },
        ticketWorkflowStates: {
          where: {
            isActive: true,
          },
          orderBy: { position: "asc" },
          include: {
            assignee: true,
          },
        },
        product: true,
        workflow: true,
      },
    });
  }

  @Query((_returns) => [Ticket])
  @UseMiddleware(hasRole([RoleType.OWNER, RoleType.ADMIN]))
  async getAllAwaitingEstimateTasks(
    @Ctx() ctx: AppContext<AuthRoleContext>
  ): Promise<Ticket[]> {
    return ctx.prisma.ticket.findMany({
      where: {
        organizationId: ctx.me.organizationId,
        stage: ModelStage.PUBLISHED,
        status: TicketStatus.UNSCHEDULED,
        estimating: true,
        ticketWorkflowStates: {
          some: {
            isActive: true,
            assigneeId: { not: null },
            OR: [
              { estimateMaximum: null },
              { estimateMinimum: null },
              { estimateMostLikely: null },
            ],
          },
        },
      },
      include: {
        ticketWorkflowStates: {
          include: {
            assignee: true,
          },
          where: {
            isActive: true,
          },
          orderBy: { position: "asc" },
        },
        product: true,
        workflow: true,
      },
    });
  }
}

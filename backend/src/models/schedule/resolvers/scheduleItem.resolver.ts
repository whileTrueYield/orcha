import {
  Arg,
  Query,
  Resolver,
  Int,
  UseMiddleware,
  Ctx,
  FieldResolver,
  Root,
} from "type-graphql";
import {
  Organization,
  Role,
  ScheduleItem,
  Ticket,
  TicketWorkflowState,
} from "@generated/type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";

@Resolver(ScheduleItem)
export class ScheduleItemResolver {
  @Query(() => ScheduleItem)
  @UseMiddleware(hasRole())
  async scheduleItem(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("scheduleItemId", () => Int) scheduleItemId: number
  ): Promise<ScheduleItem> {
    return ctx.prisma.scheduleItem.findFirstOrThrow({
      where: {
        id: scheduleItemId,
        organizationId: ctx.me.organizationId,
        roleId: ctx.me.roleId,
      },
    });
  }

  @Query(() => [ScheduleItem])
  @UseMiddleware(hasRole())
  async activeScheduleItems(
    @Ctx() ctx: AppContext<AuthRoleContext>
  ): Promise<ScheduleItem[]> {
    return ctx.prisma.scheduleItem.findMany({
      where: {
        organizationId: ctx.me.organizationId,
        roleId: ctx.me.roleId,
        stoppedAt: null,
      },
    });
  }

  // Returns the last schedule item for the current user
  @Query(() => ScheduleItem)
  @UseMiddleware(hasRole())
  async lastScheduleItem(
    @Ctx() ctx: AppContext<AuthRoleContext>
  ): Promise<ScheduleItem> {
    return ctx.prisma.scheduleItem.findFirstOrThrow({
      where: {
        organizationId: ctx.me.organizationId,
        roleId: ctx.me.roleId,
      },
      orderBy: {
        startedAt: "desc",
      },
    });
  }

  @FieldResolver((_returns) => Ticket)
  async ticket(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() scheduleItem: ScheduleItem
  ): Promise<Ticket> {
    if (scheduleItem.ticket) {
      return scheduleItem.ticket;
    }

    return ctx.prisma.ticket.findUniqueOrThrow({
      where: { id: scheduleItem.ticketId },
    });
  }

  @FieldResolver((_returns) => Organization)
  async organization(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() scheduleItem: ScheduleItem
  ): Promise<Organization> {
    if (scheduleItem.organization) {
      return scheduleItem.organization;
    }

    return ctx.prisma.organization.findUniqueOrThrow({
      where: { id: scheduleItem.organizationId },
    });
  }

  @FieldResolver((_returns) => Role)
  async role(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() scheduleItem: ScheduleItem
  ): Promise<Role> {
    if (scheduleItem.role) {
      return scheduleItem.role;
    }

    return ctx.prisma.role.findUniqueOrThrow({
      where: { id: scheduleItem.roleId },
      include: { user: true },
    });
  }

  @FieldResolver((_returns) => TicketWorkflowState)
  async ticketWorkflowState(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() scheduleItem: ScheduleItem
  ): Promise<TicketWorkflowState> {
    if (scheduleItem.ticketWorkflowState) {
      return scheduleItem.ticketWorkflowState;
    }

    return ctx.prisma.ticketWorkflowState.findUniqueOrThrow({
      where: { id: scheduleItem.ticketWorkflowStateId },
    });
  }

  @FieldResolver((_returns) => TicketWorkflowState, { nullable: true })
  async nextTicketWorkflowState(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() scheduleItem: ScheduleItem
  ): Promise<TicketWorkflowState | null> {
    if (scheduleItem.nextTicketWorkflowStateId) {
      if (scheduleItem.nextTicketWorkflowState) {
        return scheduleItem.nextTicketWorkflowState;
      } else {
        const ticketWorkflowState =
          await ctx.prisma.ticketWorkflowState.findUniqueOrThrow({
            where: { id: scheduleItem.nextTicketWorkflowStateId },
            include: { workflowState: true },
          });

        return ticketWorkflowState;
      }
    }

    return null;
  }
}

import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import {
  Estimate,
  Role,
  ScheduleItem,
  Ticket,
  TicketWorkflowState,
  TicketWorkflowStateNote,
  WorkflowState,
} from "@generated/type-graphql";
import { partition } from "lodash";
import { ChecklistItem } from "../entity";
import { logger } from "../../../logger";
import { EstimateType, ModelStage } from ".prisma/client";

@InputType()
export class UpdateChecklistInput {
  @Field()
  label: string;

  @Field((_type) => Boolean, { nullable: true })
  checked: boolean | null;
}

@Resolver(TicketWorkflowState)
export class TicketWorkflowStateResolver {
  @Query(() => TicketWorkflowState)
  @UseMiddleware(hasRole())
  async ticketWorkflowState(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("id", () => Int) id: number
  ): Promise<TicketWorkflowState> {
    return ctx.prisma.ticketWorkflowState.findFirstOrThrow({
      where: {
        id: id,
        workflowState: {
          organizationId: ctx.me.organizationId,
        },
      },
    });
  }

  @Mutation(() => TicketWorkflowState)
  @UseMiddleware(hasRole())
  async setChecklist(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("ticketWorkflowStateId", () => Int)
    ticketWorkflowStateId: number,
    @Arg("input", () => [UpdateChecklistInput], { nullable: "items" })
    input: UpdateChecklistInput[]
  ): Promise<TicketWorkflowState> {
    const ticketWorkflowState =
      await ctx.prisma.ticketWorkflowState.findFirstOrThrow({
        where: {
          id: ticketWorkflowStateId,
          ticket: {
            stage: { not: ModelStage.DELETED },
            organizationId: ctx.me.organizationId,
          },
        },
        include: { ticket: true },
      });

    // we'll extract the progress count to allow for quicker stats
    const [completedItems, todoItems] = partition(input, { checked: true });
    return ctx.prisma.ticketWorkflowState.update({
      where: { id: ticketWorkflowState.id },
      data: {
        todo: todoItems.length,
        complete: completedItems.length,
        checklist: JSON.stringify(input),
      },
    });
  }

  @Mutation(() => TicketWorkflowState)
  @UseMiddleware(hasRole())
  async skipTicketWorkflowState(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("id", () => Int) id: number
  ): Promise<TicketWorkflowState> {
    const tws = await ctx.prisma.ticketWorkflowState.findFirstOrThrow({
      where: {
        id,
        ticket: {
          organizationId: ctx.me.organizationId,
          stage: ModelStage.PUBLISHED,
        },
      },
    });

    return ctx.prisma.ticketWorkflowState.update({
      where: {
        id: tws.id,
      },
      data: {
        isActive: false,
      },
    });
  }

  @FieldResolver((_returns) => [ChecklistItem])
  async checklist(
    @Root() ticketWorkflowState: TicketWorkflowState
  ): Promise<ChecklistItem[]> {
    try {
      return JSON.parse(ticketWorkflowState.checklist as string);
    } catch (e) {
      logger.error(
        "Could not parse checklist on ticket workflow state ID %d",
        ticketWorkflowState.id,
        e
      );
      return [];
    }
  }

  @FieldResolver((_returns) => Ticket)
  async ticket(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() ticketWorkflowState: TicketWorkflowState
  ): Promise<Ticket> {
    if (ticketWorkflowState.ticket) {
      return ticketWorkflowState.ticket;
    } else {
      return ctx.prisma.ticket.findUniqueOrThrow({
        where: { id: ticketWorkflowState.ticketId },
      });
    }
  }

  @FieldResolver((_returns) => Role, { nullable: true })
  async assignee(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() ticketWorkflowState: TicketWorkflowState
  ): Promise<Role | null> {
    if (ticketWorkflowState.assigneeId) {
      if (ticketWorkflowState.assignee) {
        return ticketWorkflowState.assignee;
      } else {
        return ctx.prisma.role.findUnique({
          where: { id: ticketWorkflowState.assigneeId },
        });
      }
    }

    return null;
  }

  @FieldResolver((_returns) => Estimate, { nullable: true })
  async estimateSet(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() ticketWorkflowState: TicketWorkflowState
  ): Promise<Estimate | null> {
    return ctx.prisma.estimate.findFirst({
      where: {
        type: EstimateType.TicketWorkflowState,
        id: ticketWorkflowState.id,
      },
      orderBy: {
        epoch: "desc",
      },
    });
  }

  @FieldResolver((_returns) => WorkflowState, { nullable: true })
  async workflowState(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() ticketWorkflowState: TicketWorkflowState
  ): Promise<WorkflowState | null> {
    if (ticketWorkflowState.workflowStateId) {
      if (ticketWorkflowState.workflowState) {
        return ticketWorkflowState.workflowState;
      }

      return ctx.prisma.workflowState.findUniqueOrThrow({
        where: { id: ticketWorkflowState.workflowStateId },
      });
    }

    return null;
  }

  @FieldResolver((_returns) => [ScheduleItem])
  async scheduleItems(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() ticketWorkflowState: TicketWorkflowState
  ): Promise<ScheduleItem[]> {
    return ctx.prisma.scheduleItem.findMany({
      where: { ticketWorkflowStateId: ticketWorkflowState.id },
      include: { role: true },
    });
  }

  @FieldResolver((_returns) => [TicketWorkflowStateNote])
  async ticketWorkflowStateNotes(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() ticketWorkflowState: TicketWorkflowState
  ): Promise<TicketWorkflowStateNote[]> {
    if (ticketWorkflowState.ticketWorkflowStateNotes) {
      return ticketWorkflowState.ticketWorkflowStateNotes;
    }

    return ctx.prisma.ticketWorkflowStateNote.findMany({
      where: { ticketWorkflowStateId: ticketWorkflowState.id },
      include: { author: true },
      orderBy: { createdAt: "desc" },
    });
  }
}

import {
  Arg,
  Resolver,
  Mutation,
  InputType,
  Field,
  Int,
  UseMiddleware,
  Ctx,
} from "type-graphql";

import { Length } from "class-validator";
import {
  ModelStage,
  NotificationCategory,
  RoleType,
  NotificationTarget,
  Ticket,
  TicketStatus,
  TicketWorkflowStateNoteCategory,
} from "@generated/type-graphql";
import { AuthRoleContext, AppContext } from "../../../types";
import { TicketWorkflowState } from "../../entities";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { UserInputError } from "apollo-server-express";
import {
  every,
  isBoolean,
  isEmpty,
  keyBy,
  map,
  partition,
  reduce,
  without,
} from "lodash";
import { Prisma, ModelStage as DbModelStage } from ".prisma/client";
import { requestEstimate } from "../jobs/estimateTickets";
import { pushNotifyRole } from "../../../notifications/endpoints";
import { isTicketBlocked, shouldNotifyAssignee } from "../helper";
import { getWorkflowQueryForProduct } from "../../workflow/helper";
import { createNotificationsForTarget } from "../../notification/createNotification";

@InputType()
class UpdateTicketInput {
  @Field({ nullable: true })
  @Length(1, 128)
  title?: string;

  @Field(() => Int, { nullable: true })
  difficulty?: number | null;

  @Field(() => Int, { nullable: true })
  productId?: number | null;

  @Field(() => Int, { nullable: true })
  workflowId?: number | null;

  @Field(() => Int, { nullable: true })
  ownerId?: number | null;

  @Field(() => Boolean, { nullable: true })
  estimating?: boolean | null;

  @Field(() => Boolean, { nullable: true })
  milestone?: boolean | null;

  @Field(() => Int, { nullable: true })
  projectId?: number;
}

@InputType()
class TicketWorkflowStateInput {
  @Field((_type) => Int)
  ticketWorkflowStateId: number;

  @Field((_type) => Int, { nullable: true })
  assigneeId?: number;

  @Field({ nullable: true })
  isActive?: boolean;
}

@InputType()
class UpdateTicketWorkflowStateInput {
  @Field((_type) => [TicketWorkflowStateInput])
  states: TicketWorkflowStateInput[];
}

@InputType()
class EstimateTicketWorkflowStateInput {
  @Field((_type) => Int)
  ticketWorkflowStateId: number;

  @Field((_type) => Int, { nullable: true })
  minimum: number;

  @Field((_type) => Int, { nullable: true })
  maximum: number;

  @Field((_type) => Int, { nullable: true })
  mostLikely: number;

  @Field((_type) => Boolean, { defaultValue: false })
  fractionable: boolean;
}

@InputType()
class ChangeTicketWorkflowStateInput {
  @Field((_type) => Int)
  roleId: number;

  @Field((_type) => Int)
  ticketWorkflowStateId: number;

  @Field((_type) => Int, { nullable: true })
  minimum: number;

  @Field((_type) => Int, { nullable: true })
  maximum: number;

  @Field((_type) => Int, { nullable: true })
  mostLikely: number;

  @Field((_type) => Boolean, { defaultValue: false })
  fractionable: boolean;
}

@Resolver(Ticket)
export class UpdateTicketResolver {
  @Mutation(() => Ticket)
  @UseMiddleware(hasRole())
  async changeTicketWorkflowStateAssignee(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("ticketId", () => Int) ticketId: number,
    @Arg("input", () => ChangeTicketWorkflowStateInput)
    input: ChangeTicketWorkflowStateInput,
  ): Promise<Ticket> {
    const newAssignee = await ctx.prisma.role.findFirstOrThrow({
      where: {
        organizationId: ctx.me.organizationId,
        id: input.roleId,
      },
    });

    const ticketWorkflowState =
      await ctx.prisma.ticketWorkflowState.findFirstOrThrow({
        where: {
          id: input.ticketWorkflowStateId,
          ticket: {
            id: ticketId,
            organizationId: ctx.me.organizationId,
            stage: { in: [ModelStage.PUBLISHED, ModelStage.DRAFT] },
          },
        },
        include: {
          ticket: {
            include: {
              workflow: true,
              product: true,
              project: true,
            },
          },
        },
      });

    if (
      ticketWorkflowState.ticket.project.ancestorIsArchived ||
      ticketWorkflowState.ticket.project.stage === ModelStage.ARCHIVED
    ) {
      throw new UserInputError("Cannot update ticket in an archived project");
    }

    if (newAssignee.id === ticketWorkflowState.assigneeId) {
      throw new UserInputError("You have not changed assignee");
    }

    // we only update the ticketWorkflowState if there is a change in assignee
    await ctx.prisma.ticketWorkflowState.update({
      where: {
        id: ticketWorkflowState.id,
      },
      data: {
        assigneeId: newAssignee.id,
        estimateMinimum: input.minimum,
        estimateMostLikely: input.mostLikely,
        estimateMaximum: input.maximum,
        fractionable: input.fractionable,
      },
    });

    await requestEstimate(ctx.me.organizationId);

    return ticketWorkflowState.ticket;
  }

  @Mutation(() => Ticket)
  @UseMiddleware(hasRole())
  async watchTicket(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("ticketId", () => Int) ticketId: number,
  ): Promise<Ticket> {
    const ticket = await ctx.prisma.ticket.findFirstOrThrow({
      where: {
        id: ticketId,
        organizationId: ctx.me.organizationId,
        stage: { not: ModelStage.DELETED },
      },
    });

    return ctx.prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        watchers: {
          connect: { id: ctx.me.roleId },
        },
      },
      include: {
        watchers: true,
      },
    });
  }

  @Mutation(() => Ticket)
  @UseMiddleware(hasRole())
  async unwatchTicket(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("ticketId", () => Int) ticketId: number,
  ): Promise<Ticket> {
    const ticket = await ctx.prisma.ticket.findFirstOrThrow({
      where: {
        id: ticketId,
        organizationId: ctx.me.organizationId,
        stage: { not: ModelStage.DELETED },
      },
    });

    return ctx.prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        watchers: {
          disconnect: { id: ctx.me.roleId },
        },
      },
      include: {
        watchers: true,
      },
    });
  }

  @Mutation(() => Ticket)
  @UseMiddleware(hasRole())
  async markTicketNotDone(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("ticketId", () => Int) ticketId: number,
  ): Promise<Ticket> {
    const ticket = await ctx.prisma.ticket.findFirstOrThrow({
      where: {
        id: ticketId,
        organizationId: ctx.me.organizationId,
        stage: ModelStage.PUBLISHED,
        status: { in: [TicketStatus.CANCELLED, TicketStatus.DONE] },
      },
      include: {
        project: true,
      },
    });

    if (
      ticket.project.stage === ModelStage.ARCHIVED ||
      ticket.project.ancestorIsArchived
    ) {
      throw new UserInputError("Cannot update ticket in an archived project");
    }

    await requestEstimate(ctx.me.organizationId);

    return ctx.prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        status: TicketStatus.SCHEDULED,
      },
    });
  }

  @Mutation(() => Ticket)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async updateTicketStage(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("ticketId", () => Int) ticketId: number,
    @Arg("stage", () => ModelStage) stage: ModelStage,
  ): Promise<Ticket> {
    const ticket = await ctx.prisma.ticket.findFirstOrThrow({
      where: {
        id: ticketId,
        organizationId: ctx.me.organizationId,
        stage: { not: ModelStage.DELETED },
      },
      include: {
        workflow: true,
        product: true,
        ticketWorkflowStates: true,
        project: true,
      },
    });

    if (
      ticket.project.ancestorIsArchived ||
      ticket.project.stage === ModelStage.ARCHIVED
    ) {
      throw new UserInputError("Cannot update ticket in an archived project");
    }

    const allowedTransitions: { [key: string]: DbModelStage[] } = {
      // you cannot transition to Draft
      [ModelStage.DRAFT]: [],
      // You can transition to archived from draft and published ticket
      [ModelStage.ARCHIVED]: [DbModelStage.DRAFT, DbModelStage.PUBLISHED],
      // you can only publish a draft ticket (cannot come back from archived)
      [ModelStage.PUBLISHED]: [DbModelStage.DRAFT],
      // draft, archived and published can be deleted
      [ModelStage.DELETED]: [
        DbModelStage.DRAFT,
        DbModelStage.ARCHIVED,
        DbModelStage.PUBLISHED,
      ],
    };

    if (
      stage in allowedTransitions &&
      allowedTransitions[stage].indexOf(ticket.stage) > -1
    ) {
      const data: Prisma.TicketUncheckedUpdateInput = {
        stage,
      };

      // Do all the checks when attempting to publish a ticket:
      // - a product needs to be assigned
      // - the assigned product needs to be published
      // - a workflow needs to be assigned
      // - the assigned workflow needs to be published
      if (stage === ModelStage.PUBLISHED) {
        if (!ticket.product) {
          throw new UserInputError("Ticket requires a published product");
        }

        if (ticket.product.stage !== ModelStage.PUBLISHED) {
          throw new UserInputError(
            `Product ${ticket.product.name} has not been published`,
          );
        }

        if (!ticket.workflow) {
          throw new UserInputError("Ticket requires a published workflow");
        }

        if (ticket.workflow.stage !== ModelStage.PUBLISHED) {
          throw new UserInputError(
            `Workflow ${ticket.workflow.name} has not been published`,
          );
        }

        // when re-publishing, we want to unschedule the ticket
        data.status = TicketStatus.UNSCHEDULED;

        // assigne a localId
        if (!ticket.localId) {
          const last_ticket = await ctx.prisma.ticket.findFirst({
            where: {
              productId: ticket.productId,
              organizationId: ctx.me.organizationId,
              localId: { not: null },
            },
            select: { localId: true },
            orderBy: { localId: "desc" },
          });

          // set the local ID to 1 or 1 after the last local Id created
          data.localId = last_ticket?.localId ? last_ticket?.localId + 1 : 1;
        }

        // if the ticket doesn't already have states, we will create them.
        // this caters to the case where the ticket is restored from being
        // archived and therefore already has states
        if (ticket.ticketWorkflowStates.length === 0) {
          // We'll attempt to set the initial state of the ticket
          const states = await ctx.prisma.workflowState.findMany({
            where: {
              workflowId: ticket.workflow.id,
            },
            orderBy: { position: "asc" },
          });

          // using a workflow with no states does not make any sense
          if (states.length === 0) {
            throw new UserInputError(
              "This workflow does not contain any states",
            );
          }

          // create a copy the workflow states for ticket. Changing
          // the workflow from now on will not change the ticket's workflow
          await ctx.prisma.ticketWorkflowState.createMany({
            data: states.map((tws) => ({
              workflowStateId: tws.id,
              name: tws.name,
              position: tws.position,
              ticketId: ticket.id,
            })),
          });
        }
      }

      // if we leave the PUBLISHED state, we should stop all active work
      if (ticket.stage === ModelStage.PUBLISHED) {
        await ctx.prisma.scheduleItem.updateMany({
          where: {
            ticketId: ticket.id,
            stoppedAt: null,
          },
          data: {
            stoppedAt: new Date(),
          },
        });
      }

      // delete all notifications relating to this ticket
      if (stage === ModelStage.DELETED) {
        await ctx.prisma.notification.deleteMany({
          where: { target: NotificationTarget.TICKET, targetId: ticket.id },
        });

        const questions = await ctx.prisma.question.findMany({
          where: { ticketId: ticket.id },
          include: {
            replies: { select: { id: true } },
          },
        });
        const questionIds = map(questions, "id");
        const replyIds = reduce(
          questions,
          (acc: number[], question) => [...acc, ...map(question.replies, "id")],
          [],
        );

        // delete notifications relating to the questions on the ticket
        await ctx.prisma.notification.deleteMany({
          where: {
            target: NotificationTarget.QUESTION,
            targetId: { in: questionIds },
          },
        });
        // ... then delete notifications relating to their replies
        await ctx.prisma.notification.deleteMany({
          where: {
            target: NotificationTarget.REPLY,
            targetId: { in: replyIds },
          },
        });
      }

      if (data.stage === ModelStage.DELETED) {
        data.deletedAt = new Date();
      }
      if (data.stage === ModelStage.ARCHIVED) {
        data.archivedAt = new Date();
      }

      return ctx.prisma.ticket.update({ where: { id: ticket.id }, data });
    }

    throw new UserInputError(`Cannot go from ${ticket.stage} to ${stage}`);
  }

  @Mutation(() => Ticket)
  @UseMiddleware(hasRole())
  async unblockTicket(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("ticketId", () => Int) ticketId: number,
    @Arg("ticketWorkflowStateId", () => Int) ticketWorkflowStateId: number,
    @Arg("note", () => String) note: string,
  ): Promise<Ticket> {
    const ticketWorkflowState =
      await ctx.prisma.ticketWorkflowState.findFirstOrThrow({
        where: {
          id: ticketWorkflowStateId,
          ticket: {
            id: ticketId,
            organizationId: ctx.me.organizationId,
            stage: ModelStage.PUBLISHED,
          },
        },
        include: {
          ticket: {
            include: {
              project: true,
            },
          },
        },
      });

    if (!ticketWorkflowState.isBlocked) {
      throw new UserInputError("This state is not blocked");
    }

    const { ticket } = ticketWorkflowState;

    if (
      ticket.project.ancestorIsArchived ||
      ticket.project.stage === ModelStage.ARCHIVED
    ) {
      throw new UserInputError("Cannot unblock ticket in an archived project");
    }

    // mark the ticket workflow state as blocked
    await ctx.prisma.$transaction([
      ctx.prisma.ticketWorkflowState.update({
        where: { id: ticketWorkflowState.id },
        data: { isBlocked: false },
      }),
      ctx.prisma.ticketWorkflowStateNote.create({
        data: {
          author: { connect: { id: ctx.me.roleId } },
          body: note,
          ticketWorkflowState: { connect: { id: ticketWorkflowState.id } },
          fromTicketWorkflowState: { connect: { id: ticketWorkflowState.id } },
          category: TicketWorkflowStateNoteCategory.UNBLOCK_NOTE,
        },
      }),
    ]);

    return ctx.prisma.ticket.findFirstOrThrow({
      where: { id: ticketId },
      include: { ticketWorkflowStates: true },
    });
  }

  @Mutation(() => Ticket)
  @UseMiddleware(hasRole())
  async blockTicket(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("ticketId", () => Int) ticketId: number,
    @Arg("ticketWorkflowStateId", () => Int) ticketWorkflowStateId: number,
    @Arg("note", () => String) note: string,
  ): Promise<Ticket> {
    const ticketWorkflowState =
      await ctx.prisma.ticketWorkflowState.findFirstOrThrow({
        where: {
          id: ticketWorkflowStateId,
          ticket: {
            id: ticketId,
            organizationId: ctx.me.organizationId,
            stage: ModelStage.PUBLISHED,
          },
        },
        include: {
          ticket: {
            include: {
              ticketWorkflowStates: true,
              project: true,
            },
          },
        },
      });

    if (await isTicketBlocked(ctx.me.organizationId, ticketId)) {
      throw new UserInputError("This ticket is already blocked");
    }

    const { ticket } = ticketWorkflowState;

    if (
      ticket.project.ancestorIsArchived ||
      ticket.project.stage === ModelStage.ARCHIVED
    ) {
      throw new UserInputError("Cannot block ticket in an archived project");
    }

    // stop any current work on this ticket workflow state
    await ctx.prisma.scheduleItem.updateMany({
      where: {
        ticketId,
        stoppedAt: null,
      },
      data: {
        stoppedAt: new Date(),
      },
    });

    // mark the ticket workflow state as blocked
    await ctx.prisma.$transaction([
      ctx.prisma.ticketWorkflowState.update({
        where: { id: ticketWorkflowState.id },
        data: { isBlocked: true },
      }),
      ctx.prisma.ticketWorkflowStateNote.create({
        data: {
          author: { connect: { id: ctx.me.roleId } },
          body: note,
          ticketWorkflowState: { connect: { id: ticketWorkflowState.id } },
          fromTicketWorkflowState: { connect: { id: ticketWorkflowState.id } },
          category: TicketWorkflowStateNoteCategory.BLOCK_NOTE,
        },
      }),
    ]);

    return ctx.prisma.ticket.findFirstOrThrow({
      where: { id: ticketId },
      include: { ticketWorkflowStates: true },
    });
  }

  @Mutation(() => Ticket)
  @UseMiddleware(hasRole())
  async updateTicketStatus(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("ticketId", () => Int) ticketId: number,
    @Arg("status", () => TicketStatus) status: TicketStatus,
    @Arg("note", () => String, { nullable: true }) note: string | null,
  ): Promise<Ticket> {
    const ticket = await ctx.prisma.ticket.findFirstOrThrow({
      where: {
        id: ticketId,
        organizationId: ctx.me.organizationId,
        stage: ModelStage.PUBLISHED,
      },
      include: {
        project: true,
      },
    });

    if (
      ticket.project.ancestorIsArchived ||
      ticket.project.stage === ModelStage.ARCHIVED
    ) {
      throw new UserInputError("Cannot update ticket in an archived project");
    }

    if (status === TicketStatus.SCHEDULED) {
      throw new UserInputError(`Use scheduleTicket to schedule a ticket`);
    }

    if (ticket.status === status) {
      throw new UserInputError(`This ticket is already ${status}`);
    }

    const now = new Date();
    const data: Prisma.TicketUpdateInput = { status };

    if (status === TicketStatus.DONE || status === TicketStatus.CANCELLED) {
      data.closingNote = note;
      data.closedAt = now;

      // notify the owner of the ticket that it has been closed
      if (ticket.ownerId) {
        await createNotificationsForTarget(
          ctx.me.organizationId,
          NotificationCategory.CLOSED_TICKET,
          NotificationTarget.TICKET,
          ticket.id,
          [ticket.ownerId],
          ctx.me.roleId,
          status === TicketStatus.DONE
            ? `{} closed a ticket you own`
            : `{} cancelled a ticket you own`,
        );
      }
    }

    // if we are leaving the open state
    // we will need to close all work being done on that ticket
    if (ticket.status === TicketStatus.SCHEDULED) {
      await ctx.prisma.scheduleItem.updateMany({
        where: {
          ticketId: ticket.id,
          stoppedAt: null,
        },
        data: {
          done: true,
          stoppedAt: now,
        },
      });

      // since we are leaving a schedule state, we need to re-compute the
      // predicted schedule
      await requestEstimate(ctx.me.organizationId);
    }

    return ctx.prisma.ticket.update({
      where: { id: ticket.id },
      data,
    });
  }

  @Mutation(() => TicketWorkflowState)
  @UseMiddleware(hasRole())
  async estimateTicketWorkflowState(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("ticketId", () => Int) ticketId: number,
    @Arg("input", () => EstimateTicketWorkflowStateInput)
    input: EstimateTicketWorkflowStateInput,
  ): Promise<TicketWorkflowState> {
    // making sure the ticket belong to the right organization and was not deleted
    const ticketWorkflowStates = await ctx.prisma.ticketWorkflowState.findMany({
      where: {
        isActive: true,
        ticket: {
          id: ticketId,
          organizationId: ctx.me.organizationId,
          stage: { in: [ModelStage.PUBLISHED, ModelStage.DRAFT] },
        },
      },
      include: { ticket: { include: { project: true } } },
    });

    const [[targetTicketWorkflowState], otherTicketWorkflowStates] = partition(
      ticketWorkflowStates,
      {
        id: input.ticketWorkflowStateId,
      }
    );

    if (!targetTicketWorkflowState) {
      throw new UserInputError("Cannot find workflow state to update");
    }

    if (
      targetTicketWorkflowState.ticket.project.ancestorIsArchived ||
      targetTicketWorkflowState.ticket.project.stage === ModelStage.ARCHIVED
    ) {
      throw new UserInputError("Cannot update ticket in an archived project");
    }

    if (
      every(
        otherTicketWorkflowStates,
        (state: TicketWorkflowState) =>
          state.estimateMinimum &&
          state.estimateMostLikely &&
          state.estimateMaximum
      ) &&
      targetTicketWorkflowState.ticket.ownerId
    ) {
      await pushNotifyRole(
        targetTicketWorkflowState.ticket.ownerId,
        ctx.me.organizationId,
        "READY_TO_SCHEDULE",
        "A ticket you own is ready to be scheduled.",
        {
          targetId: targetTicketWorkflowState.ticket.id,
        }
      );
    }

    return await ctx.prisma.ticketWorkflowState.update({
      where: { id: targetTicketWorkflowState.id },
      data: {
        estimateMinimum: input.minimum,
        estimateMostLikely: input.mostLikely,
        estimateMaximum: input.maximum,
        fractionable: input.fractionable,
      },
    });
  }

  @Mutation(() => Ticket)
  @UseMiddleware(hasRole())
  async removeTicketAncestor(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("ticketId", () => Int) ticketId: number,
    @Arg("ancestorId", () => Int) ancestorId: number,
  ): Promise<Ticket> {
    const ticket = await ctx.prisma.ticket.findFirstOrThrow({
      where: {
        id: ticketId,
        organizationId: ctx.me.organizationId,
        stage: { in: [ModelStage.PUBLISHED, ModelStage.DRAFT] },
      },
      include: {
        ancestors: true,
        project: true,
      },
    });

    if (
      ticket.project.ancestorIsArchived ||
      ticket.project.stage === ModelStage.ARCHIVED
    ) {
      throw new UserInputError("Cannot update ticket in an archived project");
    }

    const ancestorIds = map(ticket.ancestors, "id");
    if (ancestorIds.indexOf(ancestorId) > -1) {
      requestEstimate(ctx.me.organizationId);
      return ctx.prisma.ticket.update({
        where: {
          id: ticketId,
        },
        data: {
          ancestors: {
            set: without(ancestorIds, ancestorId).map((id) => ({ id })),
          },
        },
      });
    }

    return ticket;
  }

  @Mutation(() => Ticket)
  @UseMiddleware(hasRole())
  async addTicketAncestor(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("ticketId", () => Int) ticketId: number,
    @Arg("ancestorId", () => Int) ancestorId: number,
  ): Promise<Ticket> {
    const ticket = await ctx.prisma.ticket.findFirstOrThrow({
      where: {
        id: ticketId,
        organizationId: ctx.me.organizationId,
        stage: { in: [ModelStage.PUBLISHED, ModelStage.DRAFT] },
      },
      include: {
        ancestors: true,
        project: true,
      },
    });

    if (
      ticket.project.ancestorIsArchived ||
      ticket.project.stage === ModelStage.ARCHIVED
    ) {
      throw new UserInputError("Cannot update ticket in an archived project");
    }

    const assertCircularDependencies = async (
      sourceTicket: Ticket,
      ancestorTicketId: number,
    ): Promise<Ticket> => {
      if (sourceTicket.id === ancestorTicketId) {
        throw new UserInputError(
          "Connection would generate a circular dependency",
        );
      }

      const ancestor = await ctx.prisma.ticket.findFirstOrThrow({
        where: {
          id: ancestorTicketId,
          organizationId: ctx.me.organizationId,
          stage: { not: ModelStage.DELETED },
        },
        include: { ancestors: true },
      });

      for (const ancestorTicket of ancestor.ancestors) {
        await assertCircularDependencies(ticket, ancestorTicket.id);
      }

      return ancestor;
    };

    const ancestor = await assertCircularDependencies(ticket, ancestorId);

    requestEstimate(ctx.me.organizationId);

    return ctx.prisma.ticket.update({
      where: {
        id: ticketId,
      },
      data: {
        ancestors: {
          set: map([ancestor, ...ticket.ancestors], ({ id }) => ({ id })),
        },
      },
    });
  }

  @Mutation(() => Ticket)
  @UseMiddleware(hasRole())
  async updateTicketWorkflowStates(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("ticketId", () => Int) ticketId: number,
    @Arg("input", () => UpdateTicketWorkflowStateInput)
    input: UpdateTicketWorkflowStateInput,
  ): Promise<Ticket> {
    const ticket = await ctx.prisma.ticket.findFirstOrThrow({
      where: {
        id: ticketId,
        organizationId: ctx.me.organizationId,
        stage: ModelStage.PUBLISHED,
      },
      include: {
        project: true,
      },
    });

    if (
      ticket.project.ancestorIsArchived ||
      ticket.project.stage === ModelStage.ARCHIVED
    ) {
      throw new UserInputError("Cannot update ticket in an archived project");
    }

    const states = await ctx.prisma.ticketWorkflowState.findMany({
      where: {
        id: {
          in: input.states.map(
            ({ ticketWorkflowStateId }) => ticketWorkflowStateId,
          ),
        },
        ticketId: ticket.id,
      },
    });

    let shouldCheckIfTicketIsReadyToSchedule = false;
    const inputByWorkflowStateId = keyBy(input.states, "ticketWorkflowStateId");
    for (const state of states) {
      const input = inputByWorkflowStateId[state.id];
      const updateData: Prisma.TicketWorkflowStateUncheckedUpdateInput = {};

      // only update the role if provided
      if (input.assigneeId !== state.assigneeId) {
        if (input.assigneeId) {
          const role = await ctx.prisma.role.findFirstOrThrow({
            where: {
              id: input.assigneeId,
              organizationId: ctx.me.organizationId,
            },
          });

          updateData.assigneeId = role.id;
        } else {
          updateData.assigneeId = null;
        }
      }

      // only update the active state if provided
      if (isBoolean(input.isActive)) {
        updateData.isActive = input.isActive;
        shouldCheckIfTicketIsReadyToSchedule = true;
      }

      await ctx.prisma.ticketWorkflowState.update({
        where: { id: state.id },
        data: updateData, // temporary fix for "Excessive stack depth comparing types"
      });

      // if we are changing the assigne and the ticket is set to
      // send estimates to its assignees
      if (
        input.assigneeId &&
        input.assigneeId !== state.assigneeId &&
        ticket.estimating
      ) {
        await pushNotifyRole(
          input.assigneeId,
          ctx.me.organizationId,
          "ESTIMATE_REQUESTED",
          "You have been assigned a new ticket and it requires your estimate.",
          {
            targetId: state.id,
          },
        );
      }
    }

    // check if we need to send a 'ready to schedule' notification to the ticket owner
    if (
      shouldCheckIfTicketIsReadyToSchedule &&
      ticket.estimating &&
      ticket.ownerId
    ) {
      const estimatesRemaining = await ctx.prisma.ticketWorkflowState.count({
        where: {
          ticketId: ticket.id,
          isActive: true,
          estimateMostLikely: null,
          estimateMinimum: null,
          estimateMaximum: null,
        },
      });

      if (!estimatesRemaining) {
        await pushNotifyRole(
          ticket.ownerId,
          ctx.me.organizationId,
          "READY_TO_SCHEDULE",
          "A ticket you own is ready to be scheduled.",
          {
            targetId: ticket.id,
          }
        );
      }
    }

    return ticket;
  }

  @Mutation(() => Ticket)
  @UseMiddleware(hasRole())
  async updateTicket(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("ticketId", () => Int) ticketId: number,
    @Arg("input", () => UpdateTicketInput) input: UpdateTicketInput,
  ): Promise<Ticket> {
    if (isEmpty(input)) {
      throw new UserInputError("You have not provided any value to update");
    }

    const ticket = await ctx.prisma.ticket.findFirstOrThrow({
      where: {
        id: ticketId,
        organizationId: ctx.me.organizationId,
        stage: { in: [ModelStage.PUBLISHED, ModelStage.DRAFT] },
      },
      include: {
        ticketWorkflowStates: true,
        project: true,
      },
    });

    if (
      ticket.project.ancestorIsArchived ||
      ticket.project.stage === ModelStage.ARCHIVED
    ) {
      throw new UserInputError("Cannot update ticket in an archived project");
    }

    const data: Prisma.TicketUncheckedUpdateInput = {
      title: input.title,
    };

    if (input.milestone !== null) {
      data.milestone = input.milestone;
    }

    if (input.estimating !== null) {
      data.estimating = input.estimating;

      // if we activate estimating we'll notify all the users
      if (input.estimating && input.estimating !== ticket.estimating) {
        for (const ticketWorkflowState of ticket.ticketWorkflowStates) {
          if (shouldNotifyAssignee(ticketWorkflowState)) {
            await pushNotifyRole(
              ticketWorkflowState.assigneeId!,
              ticket.organizationId,
              "ESTIMATE_REQUESTED",
              "You have been assigned a new ticket and it requires your estimate.",
              {
                targetId: ticketWorkflowState.id,
              },
            );
          }
        }
      }
    }

    if (input.difficulty) {
      data.difficulty = input.difficulty;
    }

    if (input.ownerId) {
      const owner = await ctx.prisma.role.findFirstOrThrow({
        where: {
          organizationId: ctx.me.organizationId,
          id: input.ownerId,
        },
      });

      data.ownerId = owner.id;
    } else if (input.ownerId === null) {
      data.ownerId = null;
    }

    if (input.projectId) {
      const project = await ctx.prisma.project.findFirstOrThrow({
        where: {
          organizationId: ctx.me.organizationId,
          id: input.projectId,
        },
      });

      if (
        project.ancestorIsArchived ||
        project.stage !== ModelStage.PUBLISHED
      ) {
        throw new UserInputError("Selected project is not published");
      }

      data.projectId = project.id;
    }

    // Once the ticket leaves the draft stage, product and
    // workflow become immutables
    if (ticket.stage === ModelStage.DRAFT && input.productId) {
      const product = await ctx.prisma.product.findFirstOrThrow({
        where: {
          id: input.productId,
          organizationId: ctx.me.organizationId,
          stage: ModelStage.PUBLISHED,
        },
      });

      data.productId = product.id;

      if (input.workflowId) {
        const workflow = await ctx.prisma.workflow.findFirstOrThrow({
          where: {
            ...getWorkflowQueryForProduct(product),
            id: input.workflowId,
          },
        });

        data.workflowId = workflow.id;
      } else {
        data.workflowId = null;
      }
    }

    return ctx.prisma.ticket.update({
      where: { id: ticket.id },
      data: data as any, // temporary fix for "Excessive stack depth comparing types"
    });
  }
}

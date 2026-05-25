/**
 * Mutation resolvers for updating tickets: status, stage, workflow states,
 * dependencies, blocking, watching, and general field updates.
 *
 * Registers:
 *  - Mutation.changeTicketWorkflowStateAssignee(ticketId, input): Ticket!
 *  - Mutation.watchTicket(ticketId): Ticket!
 *  - Mutation.unwatchTicket(ticketId): Ticket!
 *  - Mutation.markTicketNotDone(ticketId): Ticket!
 *  - Mutation.updateTicketStage(ticketId, stage): Ticket!
 *  - Mutation.unblockTicket(ticketId, ticketWorkflowStateId, note): Ticket!
 *  - Mutation.blockTicket(ticketId, ticketWorkflowStateId, note): Ticket!
 *  - Mutation.updateTicketStatus(ticketId, status, note?): Ticket!
 *  - Mutation.estimateTicketWorkflowState(ticketId, input): TicketWorkflowState!
 *  - Mutation.removeTicketAncestor(ticketId, ancestorId): Ticket!
 *  - Mutation.addTicketAncestor(ticketId, ancestorId): Ticket!
 *  - Mutation.updateTicketWorkflowStates(ticketId, input): Ticket!
 *  - Mutation.updateTicket(ticketId, input): Ticket!
 */

import { GraphQLError } from "graphql";
import {
  ModelStage,
  NotificationCategory,
  NotificationTarget,
  Prisma,
  RoleType,
  TicketStatus,
  TicketWorkflowStateNoteCategory,
} from "@prisma/client";
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
import builder from "../../../schema/builder";
import { ModelStageEnum, TicketStatusEnum } from "../../../schema/enums";
import { AuthRoleContext } from "../../../types";
import { requestEstimate } from "../jobs/estimateTickets";
import { pushNotifyRole } from "../../../notifications/endpoints";
import { isTicketBlocked, shouldNotifyAssignee } from "../helper";
import { getWorkflowQueryForProduct } from "../../workflow/helper";
import { createNotificationsForTarget } from "../../notification/createNotification";

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

const UpdateTicketInput = builder.inputType("UpdateTicketInput", {
  fields: (t) => ({
    title: t.string({ required: false }),
    difficulty: t.int({ required: false }),
    productId: t.int({ required: false }),
    workflowId: t.int({ required: false }),
    ownerId: t.int({ required: false }),
    estimating: t.boolean({ required: false }),
    milestone: t.boolean({ required: false }),
    projectId: t.int({ required: false }),
  }),
});

const TicketWorkflowStateInput = builder.inputType(
  "TicketWorkflowStateInput",
  {
    fields: (t) => ({
      ticketWorkflowStateId: t.int({ required: true }),
      assigneeId: t.int({ required: false }),
      isActive: t.boolean({ required: false }),
    }),
  },
);

const UpdateTicketWorkflowStateInput = builder.inputType(
  "UpdateTicketWorkflowStateInput",
  {
    fields: (t) => ({
      states: t.field({
        type: [TicketWorkflowStateInput],
        required: true,
      }),
    }),
  },
);

const EstimateTicketWorkflowStateInput = builder.inputType(
  "EstimateTicketWorkflowStateInput",
  {
    fields: (t) => ({
      ticketWorkflowStateId: t.int({ required: true }),
      minimum: t.int({ required: false }),
      maximum: t.int({ required: false }),
      mostLikely: t.int({ required: false }),
      fractionable: t.boolean({ required: false, defaultValue: false }),
    }),
  },
);

const ChangeTicketWorkflowStateInput = builder.inputType(
  "ChangeTicketWorkflowStateInput",
  {
    fields: (t) => ({
      roleId: t.int({ required: true }),
      ticketWorkflowStateId: t.int({ required: true }),
      minimum: t.int({ required: false }),
      maximum: t.int({ required: false }),
      mostLikely: t.int({ required: false }),
      fractionable: t.boolean({ required: false, defaultValue: false }),
    }),
  },
);

// ---------------------------------------------------------------------------
// Mutation: changeTicketWorkflowStateAssignee
// ---------------------------------------------------------------------------

builder.mutationField("changeTicketWorkflowStateAssignee", (t) =>
  t.prismaField({
    type: "Ticket",
    authScopes: { hasRole: true },
    args: {
      ticketId: t.arg.int({ required: true }),
      input: t.arg({ type: ChangeTicketWorkflowStateInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;
      const input = args.input;

      const newAssignee = await ctx.prisma.role.findFirstOrThrow({
        where: {
          organizationId: me.organizationId,
          id: input.roleId,
        },
      });

      const ticketWorkflowState =
        await ctx.prisma.ticketWorkflowState.findFirstOrThrow({
          where: {
            id: input.ticketWorkflowStateId,
            ticket: {
              id: args.ticketId,
              organizationId: me.organizationId,
              stage: { in: [ModelStage.PUBLISHED, ModelStage.DRAFT] },
            },
          },
          include: {
            ticket: { include: { workflow: true, product: true, project: true } },
          },
        });

      if (
        ticketWorkflowState.ticket.project.ancestorIsArchived ||
        ticketWorkflowState.ticket.project.stage === ModelStage.ARCHIVED
      ) {
        throw new GraphQLError("Cannot update ticket in an archived project");
      }

      if (newAssignee.id === ticketWorkflowState.assigneeId) {
        throw new GraphQLError("You have not changed assignee");
      }

      await ctx.prisma.ticketWorkflowState.update({
        where: { id: ticketWorkflowState.id },
        data: {
          assigneeId: newAssignee.id,
          estimateMinimum: input.minimum ?? undefined,
          estimateMostLikely: input.mostLikely ?? undefined,
          estimateMaximum: input.maximum ?? undefined,
          fractionable: input.fractionable ?? false,
        },
      });

      await requestEstimate(me.organizationId);

      return ctx.prisma.ticket.findUniqueOrThrow({
        ...query,
        where: { id: ticketWorkflowState.ticket.id },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Mutation: watchTicket
// ---------------------------------------------------------------------------

builder.mutationField("watchTicket", (t) =>
  t.prismaField({
    type: "Ticket",
    authScopes: { hasRole: true },
    args: {
      ticketId: t.arg.int({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      const ticket = await ctx.prisma.ticket.findFirstOrThrow({
        where: {
          id: args.ticketId,
          organizationId: me.organizationId,
          stage: { not: ModelStage.DELETED },
        },
      });

      return ctx.prisma.ticket.update({
        ...query,
        where: { id: ticket.id },
        data: { watchers: { connect: { id: me.roleId } } },
        include: { ...query.include, watchers: true },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Mutation: unwatchTicket
// ---------------------------------------------------------------------------

builder.mutationField("unwatchTicket", (t) =>
  t.prismaField({
    type: "Ticket",
    authScopes: { hasRole: true },
    args: {
      ticketId: t.arg.int({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      const ticket = await ctx.prisma.ticket.findFirstOrThrow({
        where: {
          id: args.ticketId,
          organizationId: me.organizationId,
          stage: { not: ModelStage.DELETED },
        },
      });

      return ctx.prisma.ticket.update({
        ...query,
        where: { id: ticket.id },
        data: { watchers: { disconnect: { id: me.roleId } } },
        include: { ...query.include, watchers: true },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Mutation: markTicketNotDone
// ---------------------------------------------------------------------------

builder.mutationField("markTicketNotDone", (t) =>
  t.prismaField({
    type: "Ticket",
    authScopes: { hasRole: true },
    args: {
      ticketId: t.arg.int({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      const ticket = await ctx.prisma.ticket.findFirstOrThrow({
        where: {
          id: args.ticketId,
          organizationId: me.organizationId,
          stage: ModelStage.PUBLISHED,
          status: { in: [TicketStatus.CANCELLED, TicketStatus.DONE] },
        },
        include: { project: true },
      });

      if (
        ticket.project.stage === ModelStage.ARCHIVED ||
        ticket.project.ancestorIsArchived
      ) {
        throw new GraphQLError("Cannot update ticket in an archived project");
      }

      await requestEstimate(me.organizationId);

      return ctx.prisma.ticket.update({
        ...query,
        where: { id: ticket.id },
        data: { status: TicketStatus.SCHEDULED },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Mutation: updateTicketStage — requires ADMIN or OWNER role
// ---------------------------------------------------------------------------

builder.mutationField("updateTicketStage", (t) =>
  t.prismaField({
    type: "Ticket",
    authScopes: { hasRole: [RoleType.ADMIN, RoleType.OWNER] },
    args: {
      ticketId: t.arg.int({ required: true }),
      stage: t.arg({ type: ModelStageEnum, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      const ticket = await ctx.prisma.ticket.findFirstOrThrow({
        where: {
          id: args.ticketId,
          organizationId: me.organizationId,
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
        throw new GraphQLError("Cannot update ticket in an archived project");
      }

      const allowedTransitions: { [key: string]: ModelStage[] } = {
        [ModelStage.DRAFT]: [],
        [ModelStage.ARCHIVED]: [ModelStage.DRAFT, ModelStage.PUBLISHED],
        [ModelStage.PUBLISHED]: [ModelStage.DRAFT],
        [ModelStage.DELETED]: [
          ModelStage.DRAFT,
          ModelStage.ARCHIVED,
          ModelStage.PUBLISHED,
        ],
      };

      if (
        args.stage in allowedTransitions &&
        allowedTransitions[args.stage].indexOf(ticket.stage) > -1
      ) {
        const data: Prisma.TicketUncheckedUpdateInput = {
          stage: args.stage,
        };

        // Validate all constraints when publishing
        if (args.stage === ModelStage.PUBLISHED) {
          if (!ticket.product) {
            throw new GraphQLError("Ticket requires a published product");
          }

          if (ticket.product.stage !== ModelStage.PUBLISHED) {
            throw new GraphQLError(
              `Product ${ticket.product.name} has not been published`,
            );
          }

          if (!ticket.workflow) {
            throw new GraphQLError("Ticket requires a published workflow");
          }

          if (ticket.workflow.stage !== ModelStage.PUBLISHED) {
            throw new GraphQLError(
              `Workflow ${ticket.workflow.name} has not been published`,
            );
          }

          data.status = TicketStatus.UNSCHEDULED;

          // Assign localId if not already set
          if (!ticket.localId) {
            const lastTicket = await ctx.prisma.ticket.findFirst({
              where: {
                productId: ticket.productId,
                organizationId: me.organizationId,
                localId: { not: null },
              },
              select: { localId: true },
              orderBy: { localId: "desc" },
            });

            data.localId = lastTicket?.localId ? lastTicket.localId + 1 : 1;
          }

          // Create workflow states if they don't already exist
          // (handles restoring from archive where states already exist)
          if (ticket.ticketWorkflowStates.length === 0) {
            const states = await ctx.prisma.workflowState.findMany({
              where: { workflowId: ticket.workflow.id },
              orderBy: { position: "asc" },
            });

            if (states.length === 0) {
              throw new GraphQLError(
                "This workflow does not contain any states",
              );
            }

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

        // Stop all active work when leaving PUBLISHED state
        if (ticket.stage === ModelStage.PUBLISHED) {
          await ctx.prisma.scheduleItem.updateMany({
            where: { ticketId: ticket.id, stoppedAt: null },
            data: { stoppedAt: new Date() },
          });
        }

        // Delete all notifications when deleting a ticket
        if (args.stage === ModelStage.DELETED) {
          await ctx.prisma.notification.deleteMany({
            where: {
              target: NotificationTarget.TICKET,
              targetId: ticket.id,
            },
          });

          const questions = await ctx.prisma.question.findMany({
            where: { ticketId: ticket.id },
            include: { replies: { select: { id: true } } },
          });
          const questionIds = map(questions, "id");
          const replyIds = reduce(
            questions,
            (acc: number[], question) => [
              ...acc,
              ...map(question.replies, "id"),
            ],
            [],
          );

          await ctx.prisma.notification.deleteMany({
            where: {
              target: NotificationTarget.QUESTION,
              targetId: { in: questionIds },
            },
          });
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

        return ctx.prisma.ticket.update({
          ...query,
          where: { id: ticket.id },
          data,
        });
      }

      throw new GraphQLError(
        `Cannot go from ${ticket.stage} to ${args.stage}`,
      );
    },
  }),
);

// ---------------------------------------------------------------------------
// Mutation: unblockTicket
// ---------------------------------------------------------------------------

builder.mutationField("unblockTicket", (t) =>
  t.prismaField({
    type: "Ticket",
    authScopes: { hasRole: true },
    args: {
      ticketId: t.arg.int({ required: true }),
      ticketWorkflowStateId: t.arg.int({ required: true }),
      note: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      const ticketWorkflowState =
        await ctx.prisma.ticketWorkflowState.findFirstOrThrow({
          where: {
            id: args.ticketWorkflowStateId,
            ticket: {
              id: args.ticketId,
              organizationId: me.organizationId,
              stage: ModelStage.PUBLISHED,
            },
          },
          include: { ticket: { include: { project: true } } },
        });

      if (!ticketWorkflowState.isBlocked) {
        throw new GraphQLError("This state is not blocked");
      }

      const { ticket } = ticketWorkflowState;

      if (
        ticket.project.ancestorIsArchived ||
        ticket.project.stage === ModelStage.ARCHIVED
      ) {
        throw new GraphQLError(
          "Cannot unblock ticket in an archived project",
        );
      }

      await ctx.prisma.$transaction([
        ctx.prisma.ticketWorkflowState.update({
          where: { id: ticketWorkflowState.id },
          data: { isBlocked: false },
        }),
        ctx.prisma.ticketWorkflowStateNote.create({
          data: {
            author: { connect: { id: me.roleId } },
            body: args.note,
            ticketWorkflowState: {
              connect: { id: ticketWorkflowState.id },
            },
            fromTicketWorkflowState: {
              connect: { id: ticketWorkflowState.id },
            },
            category: TicketWorkflowStateNoteCategory.UNBLOCK_NOTE,
          },
        }),
      ]);

      return ctx.prisma.ticket.findFirstOrThrow({
        ...query,
        where: { id: args.ticketId },
        include: { ...query.include, ticketWorkflowStates: true },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Mutation: blockTicket
// ---------------------------------------------------------------------------

builder.mutationField("blockTicket", (t) =>
  t.prismaField({
    type: "Ticket",
    authScopes: { hasRole: true },
    args: {
      ticketId: t.arg.int({ required: true }),
      ticketWorkflowStateId: t.arg.int({ required: true }),
      note: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      const ticketWorkflowState =
        await ctx.prisma.ticketWorkflowState.findFirstOrThrow({
          where: {
            id: args.ticketWorkflowStateId,
            ticket: {
              id: args.ticketId,
              organizationId: me.organizationId,
              stage: ModelStage.PUBLISHED,
            },
          },
          include: {
            ticket: {
              include: { ticketWorkflowStates: true, project: true },
            },
          },
        });

      if (await isTicketBlocked(me.organizationId, args.ticketId)) {
        throw new GraphQLError("This ticket is already blocked");
      }

      const { ticket } = ticketWorkflowState;

      if (
        ticket.project.ancestorIsArchived ||
        ticket.project.stage === ModelStage.ARCHIVED
      ) {
        throw new GraphQLError("Cannot block ticket in an archived project");
      }

      // Stop any active work on this ticket
      await ctx.prisma.scheduleItem.updateMany({
        where: { ticketId: args.ticketId, stoppedAt: null },
        data: { stoppedAt: new Date() },
      });

      await ctx.prisma.$transaction([
        ctx.prisma.ticketWorkflowState.update({
          where: { id: ticketWorkflowState.id },
          data: { isBlocked: true },
        }),
        ctx.prisma.ticketWorkflowStateNote.create({
          data: {
            author: { connect: { id: me.roleId } },
            body: args.note,
            ticketWorkflowState: {
              connect: { id: ticketWorkflowState.id },
            },
            fromTicketWorkflowState: {
              connect: { id: ticketWorkflowState.id },
            },
            category: TicketWorkflowStateNoteCategory.BLOCK_NOTE,
          },
        }),
      ]);

      return ctx.prisma.ticket.findFirstOrThrow({
        ...query,
        where: { id: args.ticketId },
        include: { ...query.include, ticketWorkflowStates: true },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Mutation: updateTicketStatus
// ---------------------------------------------------------------------------

builder.mutationField("updateTicketStatus", (t) =>
  t.prismaField({
    type: "Ticket",
    authScopes: { hasRole: true },
    args: {
      ticketId: t.arg.int({ required: true }),
      status: t.arg({ type: TicketStatusEnum, required: true }),
      note: t.arg.string({ required: false }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      const ticket = await ctx.prisma.ticket.findFirstOrThrow({
        where: {
          id: args.ticketId,
          organizationId: me.organizationId,
          stage: ModelStage.PUBLISHED,
        },
        include: { project: true },
      });

      if (
        ticket.project.ancestorIsArchived ||
        ticket.project.stage === ModelStage.ARCHIVED
      ) {
        throw new GraphQLError("Cannot update ticket in an archived project");
      }

      if (args.status === TicketStatus.SCHEDULED) {
        throw new GraphQLError("Use scheduleTicket to schedule a ticket");
      }

      if (ticket.status === args.status) {
        throw new GraphQLError(`This ticket is already ${args.status}`);
      }

      const now = new Date();
      const data: Prisma.TicketUpdateInput = { status: args.status };

      if (
        args.status === TicketStatus.DONE ||
        args.status === TicketStatus.CANCELLED
      ) {
        data.closingNote = args.note ?? undefined;
        data.closedAt = now;

        if (ticket.ownerId) {
          await createNotificationsForTarget(
            me.organizationId,
            NotificationCategory.CLOSED_TICKET,
            NotificationTarget.TICKET,
            ticket.id,
            [ticket.ownerId],
            me.roleId,
            args.status === TicketStatus.DONE
              ? `{} closed a ticket you own`
              : `{} cancelled a ticket you own`,
          );
        }
      }

      // Close all active work when leaving SCHEDULED state
      if (ticket.status === TicketStatus.SCHEDULED) {
        await ctx.prisma.scheduleItem.updateMany({
          where: { ticketId: ticket.id, stoppedAt: null },
          data: { done: true, stoppedAt: now },
        });

        await requestEstimate(me.organizationId);
      }

      return ctx.prisma.ticket.update({
        ...query,
        where: { id: ticket.id },
        data,
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Mutation: estimateTicketWorkflowState
// ---------------------------------------------------------------------------

builder.mutationField("estimateTicketWorkflowState", (t) =>
  t.prismaField({
    type: "TicketWorkflowState",
    authScopes: { hasRole: true },
    args: {
      ticketId: t.arg.int({ required: true }),
      input: t.arg({
        type: EstimateTicketWorkflowStateInput,
        required: true,
      }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;
      const input = args.input;

      const ticketWorkflowStates =
        await ctx.prisma.ticketWorkflowState.findMany({
          where: {
            isActive: true,
            ticket: {
              id: args.ticketId,
              organizationId: me.organizationId,
              stage: { in: [ModelStage.PUBLISHED, ModelStage.DRAFT] },
            },
          },
          include: { ticket: { include: { project: true } } },
        });

      const [[targetState], otherStates] = partition(
        ticketWorkflowStates,
        { id: input.ticketWorkflowStateId },
      );

      if (!targetState) {
        throw new GraphQLError("Cannot find workflow state to update");
      }

      if (
        targetState.ticket.project.ancestorIsArchived ||
        targetState.ticket.project.stage === ModelStage.ARCHIVED
      ) {
        throw new GraphQLError("Cannot update ticket in an archived project");
      }

      // Notify the owner when all other states are estimated
      if (
        every(
          otherStates,
          (state: any) =>
            state.estimateMinimum &&
            state.estimateMostLikely &&
            state.estimateMaximum,
        ) &&
        targetState.ticket.ownerId
      ) {
        await pushNotifyRole(
          targetState.ticket.ownerId,
          me.organizationId,
          "READY_TO_SCHEDULE",
          "A ticket you own is ready to be scheduled.",
          { targetId: targetState.ticket.id },
        );
      }

      return ctx.prisma.ticketWorkflowState.update({
        ...query,
        where: { id: targetState.id },
        data: {
          estimateMinimum: input.minimum ?? undefined,
          estimateMostLikely: input.mostLikely ?? undefined,
          estimateMaximum: input.maximum ?? undefined,
          fractionable: input.fractionable ?? false,
        },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Mutation: removeTicketAncestor
// ---------------------------------------------------------------------------

builder.mutationField("removeTicketAncestor", (t) =>
  t.prismaField({
    type: "Ticket",
    authScopes: { hasRole: true },
    args: {
      ticketId: t.arg.int({ required: true }),
      ancestorId: t.arg.int({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      const ticket = await ctx.prisma.ticket.findFirstOrThrow({
        where: {
          id: args.ticketId,
          organizationId: me.organizationId,
          stage: { in: [ModelStage.PUBLISHED, ModelStage.DRAFT] },
        },
        include: { ancestors: true, project: true },
      });

      if (
        ticket.project.ancestorIsArchived ||
        ticket.project.stage === ModelStage.ARCHIVED
      ) {
        throw new GraphQLError("Cannot update ticket in an archived project");
      }

      const ancestorIds = map(ticket.ancestors, "id");
      if (ancestorIds.indexOf(args.ancestorId) > -1) {
        requestEstimate(me.organizationId);
        return ctx.prisma.ticket.update({
          ...query,
          where: { id: args.ticketId },
          data: {
            ancestors: {
              set: without(ancestorIds, args.ancestorId).map((id) => ({
                id,
              })),
            },
          },
        });
      }

      return ticket;
    },
  }),
);

// ---------------------------------------------------------------------------
// Mutation: addTicketAncestor
// ---------------------------------------------------------------------------

builder.mutationField("addTicketAncestor", (t) =>
  t.prismaField({
    type: "Ticket",
    authScopes: { hasRole: true },
    args: {
      ticketId: t.arg.int({ required: true }),
      ancestorId: t.arg.int({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      const ticket = await ctx.prisma.ticket.findFirstOrThrow({
        where: {
          id: args.ticketId,
          organizationId: me.organizationId,
          stage: { in: [ModelStage.PUBLISHED, ModelStage.DRAFT] },
        },
        include: { ancestors: true, project: true },
      });

      if (
        ticket.project.ancestorIsArchived ||
        ticket.project.stage === ModelStage.ARCHIVED
      ) {
        throw new GraphQLError("Cannot update ticket in an archived project");
      }

      // Recursive circular dependency check
      const assertCircularDependencies = async (
        sourceTicketId: number,
        ancestorTicketId: number,
      ): Promise<any> => {
        if (sourceTicketId === ancestorTicketId) {
          throw new GraphQLError(
            "Connection would generate a circular dependency",
          );
        }

        const ancestor = await ctx.prisma.ticket.findFirstOrThrow({
          where: {
            id: ancestorTicketId,
            organizationId: me.organizationId,
            stage: { not: ModelStage.DELETED },
          },
          include: { ancestors: true },
        });

        for (const ancestorTicket of ancestor.ancestors) {
          await assertCircularDependencies(ticket.id, ancestorTicket.id);
        }

        return ancestor;
      };

      const ancestor = await assertCircularDependencies(
        ticket.id,
        args.ancestorId,
      );

      requestEstimate(me.organizationId);

      return ctx.prisma.ticket.update({
        ...query,
        where: { id: args.ticketId },
        data: {
          ancestors: {
            set: map([ancestor, ...ticket.ancestors], ({ id }) => ({ id })),
          },
        },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Mutation: updateTicketWorkflowStates
// ---------------------------------------------------------------------------

builder.mutationField("updateTicketWorkflowStates", (t) =>
  t.prismaField({
    type: "Ticket",
    authScopes: { hasRole: true },
    args: {
      ticketId: t.arg.int({ required: true }),
      input: t.arg({
        type: UpdateTicketWorkflowStateInput,
        required: true,
      }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      const ticket = await ctx.prisma.ticket.findFirstOrThrow({
        where: {
          id: args.ticketId,
          organizationId: me.organizationId,
          stage: ModelStage.PUBLISHED,
        },
        include: { project: true },
      });

      if (
        ticket.project.ancestorIsArchived ||
        ticket.project.stage === ModelStage.ARCHIVED
      ) {
        throw new GraphQLError("Cannot update ticket in an archived project");
      }

      const states = await ctx.prisma.ticketWorkflowState.findMany({
        where: {
          id: {
            in: args.input.states.map(
              (s) => s.ticketWorkflowStateId,
            ),
          },
          ticketId: ticket.id,
        },
      });

      let shouldCheckIfTicketIsReadyToSchedule = false;
      const inputByWorkflowStateId = keyBy(
        args.input.states,
        "ticketWorkflowStateId",
      );

      for (const state of states) {
        const stateInput = inputByWorkflowStateId[state.id];
        const updateData: Prisma.TicketWorkflowStateUncheckedUpdateInput = {};

        // Update the role if changed
        if (stateInput.assigneeId !== state.assigneeId) {
          if (stateInput.assigneeId) {
            const role = await ctx.prisma.role.findFirstOrThrow({
              where: {
                id: stateInput.assigneeId,
                organizationId: me.organizationId,
              },
            });
            updateData.assigneeId = role.id;
          } else {
            updateData.assigneeId = null;
          }
        }

        // Update active state if provided
        if (isBoolean(stateInput.isActive)) {
          updateData.isActive = stateInput.isActive;
          shouldCheckIfTicketIsReadyToSchedule = true;
        }

        await ctx.prisma.ticketWorkflowState.update({
          where: { id: state.id },
          data: updateData,
        });

        // Notify assignee about estimation request when reassigned
        if (
          stateInput.assigneeId &&
          stateInput.assigneeId !== state.assigneeId &&
          ticket.estimating
        ) {
          await pushNotifyRole(
            stateInput.assigneeId,
            me.organizationId,
            "ESTIMATE_REQUESTED",
            "You have been assigned a new ticket and it requires your estimate.",
            { targetId: state.id },
          );
        }
      }

      // Check if all estimates are in and notify the owner
      if (
        shouldCheckIfTicketIsReadyToSchedule &&
        ticket.estimating &&
        ticket.ownerId
      ) {
        const estimatesRemaining =
          await ctx.prisma.ticketWorkflowState.count({
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
            me.organizationId,
            "READY_TO_SCHEDULE",
            "A ticket you own is ready to be scheduled.",
            { targetId: ticket.id },
          );
        }
      }

      return ctx.prisma.ticket.findUniqueOrThrow({
        ...query,
        where: { id: ticket.id },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Mutation: updateTicket — general field update
// ---------------------------------------------------------------------------

builder.mutationField("updateTicket", (t) =>
  t.prismaField({
    type: "Ticket",
    authScopes: { hasRole: true },
    args: {
      ticketId: t.arg.int({ required: true }),
      input: t.arg({ type: UpdateTicketInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;
      const input = args.input;

      if (isEmpty(input)) {
        throw new GraphQLError("You have not provided any value to update");
      }

      const ticket = await ctx.prisma.ticket.findFirstOrThrow({
        where: {
          id: args.ticketId,
          organizationId: me.organizationId,
          stage: { in: [ModelStage.PUBLISHED, ModelStage.DRAFT] },
        },
        include: { ticketWorkflowStates: true, project: true },
      });

      if (
        ticket.project.ancestorIsArchived ||
        ticket.project.stage === ModelStage.ARCHIVED
      ) {
        throw new GraphQLError("Cannot update ticket in an archived project");
      }

      const data: Prisma.TicketUncheckedUpdateInput = {
        title: input.title ?? undefined,
      };

      if (input.milestone !== null && input.milestone !== undefined) {
        data.milestone = input.milestone;
      }

      if (input.estimating !== null && input.estimating !== undefined) {
        data.estimating = input.estimating;

        // Notify all assignees when estimating is activated
        if (input.estimating && input.estimating !== ticket.estimating) {
          for (const ticketWorkflowState of ticket.ticketWorkflowStates) {
            if (shouldNotifyAssignee(ticketWorkflowState)) {
              await pushNotifyRole(
                ticketWorkflowState.assigneeId!,
                ticket.organizationId,
                "ESTIMATE_REQUESTED",
                "You have been assigned a new ticket and it requires your estimate.",
                { targetId: ticketWorkflowState.id },
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
            organizationId: me.organizationId,
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
            organizationId: me.organizationId,
            id: input.projectId,
          },
        });

        if (
          project.ancestorIsArchived ||
          project.stage !== ModelStage.PUBLISHED
        ) {
          throw new GraphQLError("Selected project is not published");
        }

        data.projectId = project.id;
      }

      // Product and workflow are immutable once published
      if (ticket.stage === ModelStage.DRAFT && input.productId) {
        const product = await ctx.prisma.product.findFirstOrThrow({
          where: {
            id: input.productId,
            organizationId: me.organizationId,
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
        ...query,
        where: { id: ticket.id },
        data: data as any, // temporary fix for "Excessive stack depth comparing types"
      });
    },
  }),
);

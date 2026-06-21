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
 *  - Mutation.changeTicketWorkflow(ticketId, workflowId): Ticket!
 *  - Mutation.supersedeTicketWorkflow(ticketId, workflowId): Ticket!
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
import { getBody } from "../../../markdown/bodyRepository";
import { writeDocumentBody } from "../../documentBody/writeDocumentBody";

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

// ---------------------------------------------------------------------------
// Mutation: changeTicketWorkflow — reset the plan, keep the identity (ADR 0010)
// ---------------------------------------------------------------------------

// Change a *published* Ticket's workflow when it has no logged work. The line
// that governs whether a workflow may change in place is whether any
// ScheduleItem exists (ADR 0010): with zero logged work the Ticket is still a
// plan, so we swap its workflow without touching its identity (id, localId,
// comments, watchers, dependency edges). Once work is logged the Ticket has
// become a history and must be superseded instead (issue #110) — rewriting it in
// place would make it misrepresent what actually happened, so we reject it here.
//
// Authority is member-level (`hasRole: true`), matching updateTicket: editing a
// plan is an edit, not a lifecycle transition. (The supersede path in #110 is
// ADMIN/OWNER, like updateTicketStage.)
builder.mutationField("changeTicketWorkflow", (t) =>
  t.prismaField({
    type: "Ticket",
    authScopes: { hasRole: true },
    args: {
      ticketId: t.arg.int({ required: true }),
      workflowId: t.arg.int({ required: true }),
      // Phase 2 (ADR 0010): an optional destination product. Moving product
      // reassigns the per-product localId — and so the human-facing reference —
      // while the stable Ticket.id (and every FK/REST/MCP reference to it) is
      // untouched. Omit it for a same-product workflow change (Phase 1).
      productId: t.arg.int({ required: false }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      // Only a published Ticket has a plan to reset here; a DRAFT Ticket still
      // changes its workflow (and product) directly through updateTicket while
      // the lock is open.
      const ticket = await ctx.prisma.ticket.findFirstOrThrow({
        where: {
          id: args.ticketId,
          organizationId: me.organizationId,
          stage: ModelStage.PUBLISHED,
        },
        include: { product: true, project: true },
      });

      if (
        ticket.project.ancestorIsArchived ||
        ticket.project.stage === ModelStage.ARCHIVED
      ) {
        throw new GraphQLError("Cannot update ticket in an archived project");
      }

      if (!ticket.product) {
        throw new GraphQLError("Ticket requires a published product");
      }

      // A product move is requested only when a productId is given that differs
      // from the current one; the destination must be a live product in the same
      // organization. Workflow validity below is then checked against it, not the
      // origin product.
      const isProductMove =
        args.productId != null && args.productId !== ticket.productId;
      let destinationProduct = ticket.product;
      if (isProductMove) {
        const product = await ctx.prisma.product.findFirst({
          where: {
            id: args.productId!,
            organizationId: me.organizationId,
            stage: { not: ModelStage.DELETED },
          },
        });
        if (!product) {
          throw new GraphQLError("Product is not valid for this organization");
        }
        destinationProduct = product;
      }

      const workflowChanges = args.workflowId !== ticket.workflowId;

      // Nothing to do: same workflow and same product.
      if (!workflowChanges && !isProductMove) {
        throw new GraphQLError("Ticket already uses this workflow");
      }

      // The gate (ADR 0010) governs the *workflow*: any logged work turns a plan
      // into a history, and rewriting that plan in place would make the Ticket
      // misrepresent what happened — so a worked ticket whose workflow changes
      // must be superseded instead. A pure product move keeps the workflow (and
      // thus the workflow-scoped plan) intact and truthful, so logged work does
      // not bar it; only a workflow change triggers the gate.
      if (workflowChanges) {
        const loggedWork = await ctx.prisma.scheduleItem.count({
          where: { ticketId: ticket.id },
        });
        if (loggedWork > 0) {
          throw new GraphQLError(
            "This ticket has logged work; its workflow can no longer be changed in place. It must be superseded instead.",
          );
        }
      }

      // The target must be a workflow the *destination* product can attach (org
      // defaults included) and published — the same validity the publish path
      // enforces. On a move this re-validates the workflow against the new
      // product; if it is no longer valid the caller must pick one that is.
      const workflow = await ctx.prisma.workflow.findFirst({
        where: {
          ...getWorkflowQueryForProduct(destinationProduct),
          id: args.workflowId,
        },
      });
      if (!workflow) {
        throw new GraphQLError("Workflow is not valid for this product");
      }
      if (workflow.stage !== ModelStage.PUBLISHED) {
        throw new GraphQLError(
          `Workflow ${workflow.name} has not been published`,
        );
      }

      // On a move the ticket takes the next free localId within the destination
      // product — the same per-product assignment the publish path makes.
      const productMove = isProductMove
        ? await (async () => {
            const lastTicket = await ctx.prisma.ticket.findFirst({
              where: {
                productId: destinationProduct.id,
                organizationId: me.organizationId,
                localId: { not: null },
              },
              select: { localId: true },
              orderBy: { localId: "desc" },
            });
            return {
              product: { connect: { id: destinationProduct.id } },
              localId: lastTicket?.localId ? lastTicket.localId + 1 : 1,
            };
          })()
        : {};

      // A pure product move keeps the workflow, so the plan stays valid and
      // truthful: reassign productId + localId only, leaving the plan, estimates
      // and status untouched — the Ticket does not re-enter estimation.
      if (!workflowChanges) {
        await ctx.prisma.ticket.update({
          where: { id: ticket.id },
          data: productMove,
        });
        return ctx.prisma.ticket.findUniqueOrThrow({
          ...query,
          where: { id: ticket.id },
        });
      }

      const states = await ctx.prisma.workflowState.findMany({
        where: { workflowId: workflow.id },
        orderBy: { position: "asc" },
      });
      if (states.length === 0) {
        throw new GraphQLError("This workflow does not contain any states");
      }

      // Reset the plan, never the history (ADR 0010): deactivate the existing
      // TicketWorkflowState rows instead of deleting them. ScheduleItem →
      // ticketWorkflowState is onDelete: Cascade, so deleting the plan would
      // silently destroy any logged work; deactivation keeps every row (and its
      // snapshot name) attached and truthful. Fresh active rows then carry the
      // new workflow's stages, and the Ticket re-enters estimation
      // (status=UNSCHEDULED, estimating=true) exactly as publishing does. Any
      // product move rides along in the same update.
      await ctx.prisma.$transaction([
        ctx.prisma.ticketWorkflowState.updateMany({
          where: { ticketId: ticket.id },
          data: { isActive: false },
        }),
        ctx.prisma.ticketWorkflowState.createMany({
          data: states.map((state) => ({
            workflowStateId: state.id,
            name: state.name,
            position: state.position,
            ticketId: ticket.id,
          })),
        }),
        ctx.prisma.ticket.update({
          where: { id: ticket.id },
          data: {
            ...productMove,
            workflow: { connect: { id: workflow.id } },
            status: TicketStatus.UNSCHEDULED,
            estimating: true,
          },
        }),
      ]);

      // Notify any assignee that the fresh stages need (re-)estimation — the
      // same side effect publishing runs. Fresh rows start unassigned, so this
      // is a no-op today; it stays so the behaviour holds if future work carries
      // assignees across a change.
      const freshStates = await ctx.prisma.ticketWorkflowState.findMany({
        where: { ticketId: ticket.id, isActive: true },
      });
      for (const tws of freshStates) {
        if (shouldNotifyAssignee(tws)) {
          await pushNotifyRole(
            tws.assigneeId!,
            ticket.organizationId,
            "ESTIMATE_REQUESTED",
            "You have been assigned a new ticket and it requires your estimate.",
            { targetId: tws.id },
          );
        }
      }

      // The Ticket is now unscheduled with unestimated stages — re-run the
      // scheduler so it stops surfacing on a stale estimate.
      await requestEstimate(me.organizationId);

      return ctx.prisma.ticket.findUniqueOrThrow({
        ...query,
        where: { id: ticket.id },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Mutation: supersedeTicketWorkflow — close the worked original, continue on a
// new linked successor (ADR 0010, issue #110)
// ---------------------------------------------------------------------------

// Once a Ticket has logged work (any ScheduleItem) its workflow can no longer be
// rewritten in place: doing so would make a single Ticket misrepresent its own
// history (a live "new workflow, 0% done" headline hiding the hours already
// logged). Instead we *supersede*. The original is closed as CANCELLED — its
// logged work and deactivated plan kept as an immutable record — and the effort
// continues on a brand-new Ticket under the chosen workflow, linked back through
// supersededBy/supersedes.
//
// The successor inherits the intent (title, description, body, owner,
// difficulty, milestone, tags, folder) and the dependency edges *both ways*: it
// waits on the same ancestors, and the same successors now wait on it — so a
// ticket that depended on the original ends up waiting on the successor, the
// original's own edges reading as satisfied because it is CANCELLED. It does NOT
// inherit logged work or the plan/estimates; it re-enters estimation
// (UNSCHEDULED, estimating=true) exactly as a fresh publish does.
//
// Authority is ADMIN/OWNER (like updateTicketStage): superseding is a lifecycle
// transition, not a plan edit. The member-level in-place path is
// changeTicketWorkflow, which rejects a worked ticket and points here.
builder.mutationField("supersedeTicketWorkflow", (t) =>
  t.prismaField({
    type: "Ticket",
    authScopes: { hasRole: [RoleType.ADMIN, RoleType.OWNER] },
    args: {
      ticketId: t.arg.int({ required: true }),
      workflowId: t.arg.int({ required: true }),
      // Phase 2 (ADR 0010): an optional destination product. The successor is
      // created under it (taking a fresh localId there); omit it to supersede
      // within the same product (Phase 1).
      productId: t.arg.int({ required: false }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      const original = await ctx.prisma.ticket.findFirstOrThrow({
        where: {
          id: args.ticketId,
          organizationId: me.organizationId,
          stage: ModelStage.PUBLISHED,
        },
        include: {
          product: true,
          project: true,
          tags: true,
          ancestors: true,
          successors: true,
        },
      });

      if (
        original.project.ancestorIsArchived ||
        original.project.stage === ModelStage.ARCHIVED
      ) {
        throw new GraphQLError("Cannot update ticket in an archived project");
      }

      if (!original.product) {
        throw new GraphQLError("Ticket requires a published product");
      }

      // The successor lands in the destination product when a move is requested,
      // otherwise in the original's. Workflow validity and the successor's
      // localId below are resolved against this product.
      let destinationProduct = original.product;
      if (args.productId != null && args.productId !== original.productId) {
        const product = await ctx.prisma.product.findFirst({
          where: {
            id: args.productId,
            organizationId: me.organizationId,
            stage: { not: ModelStage.DELETED },
          },
        });
        if (!product) {
          throw new GraphQLError("Product is not valid for this organization");
        }
        destinationProduct = product;
      }

      if (args.workflowId === original.workflowId) {
        throw new GraphQLError("Ticket already uses this workflow");
      }

      // The gate (ADR 0010), inverted from changeTicketWorkflow: supersede is the
      // path *for* worked tickets. With zero logged work there is no history to
      // preserve, so the in-place reset (changeTicketWorkflow) is the honest move
      // and we send the caller back there rather than churning the ticket's
      // identity for nothing.
      const loggedWork = await ctx.prisma.scheduleItem.count({
        where: { ticketId: original.id },
      });
      if (loggedWork === 0) {
        throw new GraphQLError(
          "This ticket has no logged work; change its workflow in place instead.",
        );
      }

      // The target must be a workflow the destination product can attach and
      // published — the same validity the publish path enforces.
      const workflow = await ctx.prisma.workflow.findFirst({
        where: {
          ...getWorkflowQueryForProduct(destinationProduct),
          id: args.workflowId,
        },
      });
      if (!workflow) {
        throw new GraphQLError("Workflow is not valid for this product");
      }
      if (workflow.stage !== ModelStage.PUBLISHED) {
        throw new GraphQLError(
          `Workflow ${workflow.name} has not been published`,
        );
      }

      const states = await ctx.prisma.workflowState.findMany({
        where: { workflowId: workflow.id },
        orderBy: { position: "asc" },
      });
      if (states.length === 0) {
        throw new GraphQLError("This workflow does not contain any states");
      }

      // The successor's localId is the next free one within the destination
      // product — the same assignment the publish path makes.
      const lastTicket = await ctx.prisma.ticket.findFirst({
        where: {
          productId: destinationProduct.id,
          organizationId: me.organizationId,
          localId: { not: null },
        },
        select: { localId: true },
        orderBy: { localId: "desc" },
      });
      const nextLocalId = lastTicket?.localId ? lastTicket.localId + 1 : 1;

      // Create the successor first and close the original last: a mid-flight
      // failure then leaves the original live and uncancelled, never a closed
      // ticket with no successor to continue the work on.
      const successor = await ctx.prisma.ticket.create({
        data: {
          title: original.title,
          description: original.description,
          difficulty: original.difficulty,
          milestone: original.milestone,
          localId: nextLocalId,
          stage: ModelStage.PUBLISHED,
          status: TicketStatus.UNSCHEDULED,
          estimating: true,
          organization: { connect: { id: original.organizationId } },
          // The actor performing the supersede authors the successor; the
          // original's owner carries over so the unit of work keeps its owner.
          author: { connect: { id: me.roleId } },
          ...(original.ownerId
            ? { owner: { connect: { id: original.ownerId } } }
            : {}),
          project: { connect: { id: original.projectId } },
          product: { connect: { id: destinationProduct.id } },
          workflow: { connect: { id: workflow.id } },
          ...(original.folderId
            ? { folder: { connect: { id: original.folderId } } }
            : {}),
          tags: { connect: original.tags.map((tag) => ({ id: tag.id })) },
          // Inherit the dependency DAG both ways (ADR 0010): the successor waits
          // on the same upstreams, and the same downstreams now wait on it.
          ancestors: {
            connect: original.ancestors.map((a) => ({ id: a.id })),
          },
          successors: {
            connect: original.successors.map((s) => ({ id: s.id })),
          },
        },
      });

      // Fresh, unestimated plan rows for the new workflow's stages.
      await ctx.prisma.ticketWorkflowState.createMany({
        data: states.map((state) => ({
          workflowStateId: state.id,
          name: state.name,
          position: state.position,
          ticketId: successor.id,
        })),
      });

      // Carry the body across through the one ADR-0007 write path so mentions
      // resolve and the search index repopulates exactly as a normal edit would.
      // A never-written body reads as empty (version 0) and is simply skipped.
      const { markdown } = await getBody("ticket", original.id);
      if (markdown) {
        await writeDocumentBody({
          type: "ticket",
          id: successor.id,
          markdown,
          baseVersion: 0,
          organizationId: me.organizationId,
          actorRoleId: me.roleId,
        });
      }

      const now = new Date();

      // Stop any still-open work session on the original — the same move
      // cancelling a ticket already makes (updateTicketStatus). This sets an end
      // time on a running session; it never deletes a ScheduleItem, so the logged
      // history survives intact (ADR 0010: never delete the work).
      await ctx.prisma.scheduleItem.updateMany({
        where: { ticketId: original.id, stoppedAt: null },
        data: { done: true, stoppedAt: now },
      });

      // Close the original as the immutable record and point it at its successor.
      await ctx.prisma.ticket.update({
        where: { id: original.id },
        data: {
          status: TicketStatus.CANCELLED,
          closedAt: now,
          supersededBy: { connect: { id: successor.id } },
        },
      });

      // Notify the successor's assignees that the fresh stages need estimation —
      // the same side effect publishing runs. Fresh rows start unassigned, so
      // this is a no-op today; it stays so the behaviour holds if future work
      // carries assignees across a supersede.
      const freshStates = await ctx.prisma.ticketWorkflowState.findMany({
        where: { ticketId: successor.id, isActive: true },
      });
      for (const tws of freshStates) {
        if (shouldNotifyAssignee(tws)) {
          await pushNotifyRole(
            tws.assigneeId!,
            successor.organizationId,
            "ESTIMATE_REQUESTED",
            "You have been assigned a new ticket and it requires your estimate.",
            { targetId: tws.id },
          );
        }
      }

      // The successor is unscheduled with unestimated stages and the original has
      // left the schedule — re-run the scheduler so neither lingers on a stale
      // estimate.
      await requestEstimate(me.organizationId);

      return ctx.prisma.ticket.findUniqueOrThrow({
        ...query,
        where: { id: successor.id },
      });
    },
  }),
);

/**
 * Batch query and mutation resolvers for operating on multiple tickets at once.
 *
 * Registers:
 *  - Query.batchGetTicketTags(ticketIds): [Ticket!]!
 *  - Query.batchGetTickets(ticketIds): [Ticket!]!
 *  - Mutation.batchUpdateTicketTags(ticketIds, addTagIds, removeTagIds): [Ticket!]!
 *  - Mutation.batchUpdateTickets(ticketIds, input): TicketBatchPayload!
 *
 * batchUpdateTickets supports multiple actions: cancel, schedule, unschedule,
 * archive, unarchive, mark done, change owner/project, and estimate requests.
 */

import { ModelStage, Prisma, RoleStatus, TicketStatus } from "@prisma/client";
import { reject } from "lodash";
import builder from "../../../schema/builder";
import { TicketBatchPayloadRef } from "../entity";
import { AuthRoleContext } from "../../../types";
import { requestEstimate } from "../jobs/estimateTickets";

// ---------------------------------------------------------------------------
// Enum: BatchUpdateTicketAction
// ---------------------------------------------------------------------------

enum BatchUpdateTicketAction {
  CANCEL_TICKETS = "CANCEL_TICKETS",
  SCHEDULE_TICKETS = "SCHEDULE_TICKETS",
  UNSCHEDULE_TICKETS = "UNSCHEDULE_TICKETS",
  ARCHIVE_TICKETS = "ARCHIVE_TICKETS",
  UNARCHIVE_TICKETS = "UNARCHIVE_TICKETS",
  MARK_TICKETS_AS_DONE = "MARK_TICKETS_AS_DONE",
  CHANGE_OWNER = "CHANGE_OWNER",
  CHANGE_PROJECT = "CHANGE_PROJECT",
  REQUEST_ESTIMATE = "REQUEST_ESTIMATE",
  CANCEL_REQUEST_ESTIMATE = "CANCEL_REQUEST_ESTIMATE",
}

const BatchUpdateTicketActionEnum = builder.enumType(
  BatchUpdateTicketAction,
  { name: "BatchUpdateTicketAction" },
);

// ---------------------------------------------------------------------------
// Input type
// ---------------------------------------------------------------------------

const BatchUpdateTicketsInput = builder.inputType("BatchUpdateTicketsInput", {
  fields: (t) => ({
    actionMessage: t.string({ required: true }),
    action: t.field({ type: BatchUpdateTicketActionEnum, required: true }),
    ownerId: t.int({ required: false }),
    projectId: t.int({ required: false }),
  }),
});

// ---------------------------------------------------------------------------
// Query: batchGetTicketTags
// ---------------------------------------------------------------------------

builder.queryField("batchGetTicketTags", (t) =>
  t.prismaField({
    type: ["Ticket"],
    authScopes: { hasRole: true },
    args: {
      ticketIds: t.arg({ type: ['Int'], required: { list: true, items: false } }),
    },
    resolve: (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;
      const ticketIds = args.ticketIds.filter((id): id is number => id != null);
      return ctx.prisma.ticket.findMany({
        ...query,
        where: {
          organizationId: me.organizationId,
          stage: { not: ModelStage.DELETED },
          id: { in: ticketIds },
        },
        include: { ...query.include, tags: true },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Query: batchGetTickets
// ---------------------------------------------------------------------------

builder.queryField("batchGetTickets", (t) =>
  t.prismaField({
    type: ["Ticket"],
    authScopes: { hasRole: true },
    args: {
      ticketIds: t.arg({ type: ['Int'], required: { list: true, items: false } }),
    },
    resolve: (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;
      const ticketIds = args.ticketIds.filter((id): id is number => id != null);
      return ctx.prisma.ticket.findMany({
        ...query,
        where: {
          organizationId: me.organizationId,
          stage: { not: ModelStage.DELETED },
          id: { in: ticketIds },
        },
        include: { ...query.include, ticketWorkflowStates: true },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Mutation: batchUpdateTicketTags
// ---------------------------------------------------------------------------

builder.mutationField("batchUpdateTicketTags", (t) =>
  t.prismaField({
    type: ["Ticket"],
    authScopes: { hasRole: true },
    args: {
      ticketIds: t.arg({ type: ['Int'], required: { list: true, items: false } }),
      addTagIds: t.arg({ type: ['Int'], required: { list: true, items: false } }),
      removeTagIds: t.arg({ type: ['Int'], required: { list: true, items: false } }),
    },
    resolve: async (_query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;
      // Nullable-item lists — strip nulls before passing to Prisma
      const ticketIds = args.ticketIds.filter((id): id is number => id != null);
      const addTagIds = args.addTagIds.filter((id): id is number => id != null);
      const removeTagIds = args.removeTagIds.filter((id): id is number => id != null);

      const tickets = await ctx.prisma.ticket.findMany({
        where: {
          organizationId: me.organizationId,
          stage: { not: ModelStage.DELETED },
          id: { in: ticketIds },
        },
        include: { tags: true },
      });

      if (tickets.length === 0) {
        return tickets;
      }

      // Tags to add must belong to the current organization
      const tagsToAdd = await ctx.prisma.tag.findMany({
        where: {
          organizationId: me.organizationId,
          id: { in: addTagIds },
        },
      });

      for (const ticket of tickets) {
        let { tags } = ticket;
        // Remove tags first, then add new ones
        tags = reject(tags, (tag) => removeTagIds.includes(tag.id));
        tags = [...tags, ...tagsToAdd];

        await ctx.prisma.ticket.update({
          where: { id: ticket.id },
          data: {
            tags: { set: tags.map(({ id }) => ({ id })) },
          },
        });
      }

      return tickets;
    },
  }),
);

// ---------------------------------------------------------------------------
// Mutation: batchUpdateTickets
// ---------------------------------------------------------------------------

builder.mutationField("batchUpdateTickets", (t) =>
  t.field({
    type: TicketBatchPayloadRef,
    authScopes: { hasRole: true },
    args: {
      ticketIds: t.arg({ type: ['Int'], required: { list: true, items: false } }),
      input: t.arg({ type: BatchUpdateTicketsInput, required: true }),
    },
    resolve: async (_root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;
      const input = args.input;
      const ticketIds = args.ticketIds.filter((id): id is number => id != null);

      const ticketUpdateData: Prisma.TicketUncheckedUpdateManyInput = {};
      const ticketUpdateWhere: Prisma.TicketWhereInput = {
        organizationId: me.organizationId,
        id: { in: ticketIds },

        // Archived and deleted tickets are read-only
        stage: { notIn: [ModelStage.DELETED, ModelStage.ARCHIVED] },
        project: {
          stage: ModelStage.PUBLISHED,
          ancestorIsArchived: false,
        },
      };

      if (
        input.action === BatchUpdateTicketAction.CHANGE_OWNER &&
        input.ownerId
      ) {
        const owner = await ctx.prisma.role.findFirstOrThrow({
          where: {
            organizationId: me.organizationId,
            id: input.ownerId,
            status: RoleStatus.ACCEPTED,
          },
        });
        ticketUpdateData.ownerId = owner.id;
      } else if (
        input.action === BatchUpdateTicketAction.CHANGE_PROJECT &&
        input.projectId
      ) {
        const project = await ctx.prisma.project.findFirstOrThrow({
          where: {
            organizationId: me.organizationId,
            id: input.projectId,
            stage: ModelStage.PUBLISHED,
            ancestorIsArchived: false,
          },
        });
        ticketUpdateData.projectId = project.id;
      } else if (
        input.action === BatchUpdateTicketAction.CANCEL_TICKETS &&
        input.actionMessage
      ) {
        ticketUpdateData.status = TicketStatus.CANCELLED;
        ticketUpdateData.closedAt = new Date();
        ticketUpdateData.closingNote = input.actionMessage;
        ticketUpdateWhere.status = {
          notIn: [TicketStatus.CANCELLED, TicketStatus.DONE],
        };
      } else if (
        input.action === BatchUpdateTicketAction.MARK_TICKETS_AS_DONE &&
        input.actionMessage
      ) {
        ticketUpdateData.status = TicketStatus.DONE;
        ticketUpdateData.closedAt = new Date();
        ticketUpdateData.closingNote = input.actionMessage;
        ticketUpdateWhere.status = {
          notIn: [TicketStatus.CANCELLED, TicketStatus.DONE],
        };
      } else if (
        input.action === BatchUpdateTicketAction.ARCHIVE_TICKETS
      ) {
        ticketUpdateData.stage = ModelStage.ARCHIVED;
        ticketUpdateData.archivedAt = new Date();
      } else if (
        input.action === BatchUpdateTicketAction.UNARCHIVE_TICKETS
      ) {
        ticketUpdateWhere.stage = ModelStage.ARCHIVED;
        ticketUpdateData.stage = ModelStage.PUBLISHED;
        ticketUpdateData.archivedAt = null;
      } else if (
        input.action === BatchUpdateTicketAction.SCHEDULE_TICKETS
      ) {
        ticketUpdateData.status = TicketStatus.SCHEDULED;
        ticketUpdateData.scheduledAt = new Date();
        ticketUpdateWhere.status = TicketStatus.UNSCHEDULED;
        ticketUpdateWhere.stage = ModelStage.PUBLISHED;
        ticketUpdateWhere.ticketWorkflowStates = {
          every: {
            OR: [
              {
                estimateMinimum: { not: null },
                estimateMostLikely: { not: null },
                estimateMaximum: { not: null },
                assignee: { status: RoleStatus.ACCEPTED },
                isActive: true,
              },
              { isActive: false },
            ],
          },
        };
      } else if (
        input.action === BatchUpdateTicketAction.UNSCHEDULE_TICKETS
      ) {
        ticketUpdateData.status = TicketStatus.UNSCHEDULED;
        ticketUpdateData.scheduledAt = null;
        ticketUpdateWhere.status = TicketStatus.SCHEDULED;
      } else if (
        input.action === BatchUpdateTicketAction.REQUEST_ESTIMATE
      ) {
        ticketUpdateData.estimating = true;
        ticketUpdateWhere.status = TicketStatus.UNSCHEDULED;
        ticketUpdateWhere.estimating = false;
      } else if (
        input.action === BatchUpdateTicketAction.CANCEL_REQUEST_ESTIMATE
      ) {
        ticketUpdateData.estimating = false;
        ticketUpdateWhere.status = TicketStatus.UNSCHEDULED;
        ticketUpdateWhere.estimating = true;
      } else {
        return { count: 0 };
      }

      const result = await ctx.prisma.ticket.updateMany({
        where: ticketUpdateWhere,
        data: ticketUpdateData,
      });

      // Re-estimate when schedule-affecting changes are made
      if (
        result.count &&
        (input.action === BatchUpdateTicketAction.UNSCHEDULE_TICKETS ||
          input.action === BatchUpdateTicketAction.ARCHIVE_TICKETS ||
          input.action === BatchUpdateTicketAction.MARK_TICKETS_AS_DONE ||
          input.action === BatchUpdateTicketAction.CANCEL_TICKETS ||
          input.action === BatchUpdateTicketAction.SCHEDULE_TICKETS)
      ) {
        await requestEstimate(me.organizationId);
      }

      return result;
    },
  }),
);

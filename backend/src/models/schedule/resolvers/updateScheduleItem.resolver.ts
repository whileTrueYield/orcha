/**
 * ScheduleItem update/close/resume mutations and boundary queries.
 *
 * Registers:
 *  - Query.scheduleItemUpdateBoundaries(scheduleItemId): ScheduleItemUpdateBoundaries
 *  - Mutation.updateMyScheduleItem(scheduleItemId, input): ScheduleItem
 *  - Mutation.updateScheduleItem(scheduleItemId, input): ScheduleItem  (deprecated)
 *  - Mutation.resumeLastScheduleItem: ScheduleItem
 *  - Mutation.closeLastScheduleItem(ticketId, input?): ScheduleItem
 *  - Mutation.closeScheduleItem(scheduleItemId, input?): ScheduleItem
 *
 * Auth: hasRole (various levels depending on mutation).
 */

import builder from "../../../schema/builder";
import { GraphQLError } from "graphql";
import { TicketStatus } from "@prisma/client";
import { isAuthorOrAdmin } from "../../../utils/rbac";
import { requestEstimate } from "../../ticket/jobs/estimateTickets";
import {
  getMinStartDateForScheduleItem,
  getMaxStopDateForScheduleItem,
} from "../helper";
import { ScheduleItemUpdateBoundariesRef } from "../entity";
import { isTicketBlocked } from "../../ticket/helper";
import { AuthRoleContext } from "../../../types";

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

const CloseScheduleItemInput = builder.inputType("CloseScheduleItemInput", {
  fields: (t) => ({
    stoppedAt: t.string({ required: false }),
    done: t.boolean({ required: false }),
    note: t.string({ required: false }),
    nextTicketWorkflowStateId: t.int({ required: false }),
  }),
});

const UpdateScheduleItemInput = builder.inputType("UpdateScheduleItemInput", {
  fields: (t) => ({
    startedAt: t.string({ required: true }),
    stoppedAt: t.string({ required: false }),
  }),
});

// ---------------------------------------------------------------------------
// Shared helper: _closeScheduleItem
//
// Centralizes checks and state transitions when closing a schedule item.
// Any schedule item closure should go through here for safety.
// ---------------------------------------------------------------------------

interface CloseScheduleItemArgs {
  stoppedAt?: string | null;
  done?: boolean | null;
  note?: string | null;
  nextTicketWorkflowStateId?: number | null;
}

async function _closeScheduleItem(
  ctx: any,
  scheduleItem: any,
  input: CloseScheduleItemArgs,
) {
  const done = input.nextTicketWorkflowStateId ? true : input.done;
  const nowStr = new Date().toISOString();

  // for the Stop date:
  // - use the stoppedAt value on the provided schedule item (unchanged)
  // - fallback on the provided stoppedAt (if provided)
  // - otherwise use now()
  const stoppedAt = scheduleItem.stoppedAt
    ? scheduleItem.stoppedAt
    : input.stoppedAt
      ? input.stoppedAt
      : nowStr;

  const stoppedAtStr =
    typeof stoppedAt === "string" ? stoppedAt : stoppedAt.toISOString();

  if (stoppedAtStr > nowStr) {
    throw new GraphQLError("You cannot set a stop date in the future.", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

  if (done) {
    // if provided a next step, we do not mark the ticket as DONE
    // but will update the schedule item to point toward the provided next
    // ticket workflow state
    if (input.nextTicketWorkflowStateId) {
      await ctx.prisma.scheduleItem.updateMany({
        where: {
          OR: [
            {
              ticketId: scheduleItem.ticketId,
              ticketWorkflowStateId: scheduleItem.ticketWorkflowStateId,
              stoppedAt: null, // no stopped date means it's an active task
            },
            {
              id: scheduleItem.id,
            },
          ],
        },
        data: {
          stoppedAt: new Date(stoppedAtStr),
          done,
          nextTicketWorkflowStateId: input.nextTicketWorkflowStateId,
        },
      });

      if (input.note) {
        // Add note to the user's schedule item to maintain authorship
        await ctx.prisma.ticketWorkflowStateNote.create({
          data: {
            ticketWorkflowStateId: input.nextTicketWorkflowStateId,
            authorId: ctx.me.roleId,
            body: input.note,
            // we'll choose the nextTicketWorkflowStateId over the
            // ticketWorkflowStateId when defined. This is because you
            // can from state A->B then B->C without doing any work on
            // state B. In this case, scheduleItem would have ever been
            // created, but the nextTicketWorkflowStateId would have the
            // information about the previously set state.
            fromTicketWorkflowStateId:
              scheduleItem.nextTicketWorkflowStateId ||
              scheduleItem.ticketWorkflowStateId,
          },
        });
      }
    } else {
      // if we close the record of work without providing a next
      // step, it means we are closing the ticket (mark it as DONE)
      // we'll also close all other schedule items
      await ctx.prisma.ticket.update({
        where: { id: scheduleItem.ticketId },
        data: {
          status: TicketStatus.DONE,
          closingNote: input.note ?? undefined,
          closedAt: new Date(),
        },
      });

      // we will then stop ALL on-going work on this ticket
      // regardless of their workflow and the provided schedule item
      await ctx.prisma.scheduleItem.updateMany({
        where: {
          OR: [
            {
              ticketId: scheduleItem.ticketId,
              stoppedAt: null,
            },
            {
              id: scheduleItem.id,
            },
          ],
        },
        data: {
          done: true,
          stoppedAt: new Date(stoppedAtStr),
        },
      });
    }

    await requestEstimate(ctx.me.organizationId);

    return ctx.prisma.scheduleItem.findUniqueOrThrow({
      where: { id: scheduleItem.id },
    });
  } else {
    // we're taking a pause (the next step is the same as this step)
    return ctx.prisma.scheduleItem.update({
      where: { id: scheduleItem.id },
      data: {
        done: false,
        nextTicketWorkflowStateId: input.nextTicketWorkflowStateId ?? undefined,
        stoppedAt: new Date(stoppedAtStr),
      },
    });
  }
}

// ---------------------------------------------------------------------------
// Query: scheduleItemUpdateBoundaries
// ---------------------------------------------------------------------------

builder.queryField("scheduleItemUpdateBoundaries", (t) =>
  t.field({
    type: ScheduleItemUpdateBoundariesRef,
    authScopes: { hasRole: true },
    args: {
      scheduleItemId: t.arg.int({ required: true }),
    },
    resolve: async (_root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      const scheduleItem = await ctx.prisma.scheduleItem.findFirstOrThrow({
        where: {
          id: args.scheduleItemId,
          organizationId: me.organizationId,
        },
      });

      const minDate = await getMinStartDateForScheduleItem(scheduleItem);
      const maxDate = await getMaxStopDateForScheduleItem(scheduleItem);

      return { minDate, maxDate };
    },
  }),
);

// ---------------------------------------------------------------------------
// Mutation: updateMyScheduleItem
// ---------------------------------------------------------------------------

builder.mutationField("updateMyScheduleItem", (t) =>
  t.prismaField({
    type: "ScheduleItem",
    authScopes: { hasRole: true },
    args: {
      scheduleItemId: t.arg.int({ required: true }),
      input: t.arg({ type: UpdateScheduleItemInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      const scheduleItem = await ctx.prisma.scheduleItem.findFirstOrThrow({
        where: {
          roleId: me.roleId,
          id: args.scheduleItemId,
          organizationId: me.organizationId,
        },
      });

      if (await isTicketBlocked(me.organizationId, scheduleItem.ticketId)) {
        throw new GraphQLError("This ticket is blocked", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      if (!scheduleItem.stoppedAt && args.input.stoppedAt) {
        throw new GraphQLError("You cannot set a stop date on an ongoing task", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      if (scheduleItem.stoppedAt && !args.input.stoppedAt) {
        throw new GraphQLError("A stop date is required", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      if (!args.input.startedAt) {
        throw new GraphQLError("A start date is required", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      // we can't move items in the future
      if (new Date(args.input.startedAt) > new Date()) {
        throw new GraphQLError("Start date cannot be in the future", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      // we can't move items in the future
      if (args.input.stoppedAt && new Date(args.input.stoppedAt) > new Date()) {
        throw new GraphQLError("Stop date cannot be in the future", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      // start date must be before stop date
      if (
        args.input.stoppedAt &&
        new Date(args.input.stoppedAt) <= new Date(args.input.startedAt)
      ) {
        throw new GraphQLError("Invalid stop date", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      if (scheduleItem.stoppedAt && args.input.stoppedAt) {
        const maxStopDate = await getMaxStopDateForScheduleItem(scheduleItem);
        if (new Date(args.input.stoppedAt) > maxStopDate) {
          throw new GraphQLError("Invalid stop date", {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
      }

      const minStartDate = await getMinStartDateForScheduleItem(scheduleItem);
      if (minStartDate && new Date(args.input.startedAt) < minStartDate) {
        console.log(minStartDate, new Date(args.input.startedAt));
        throw new GraphQLError("Invalid start date", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      return ctx.prisma.scheduleItem.update({
        ...query,
        where: { id: scheduleItem.id },
        data: {
          startedAt: args.input.startedAt,
          stoppedAt: args.input.stoppedAt ?? undefined,
        },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Mutation: updateScheduleItem (deprecated passthrough)
// ---------------------------------------------------------------------------

builder.mutationField("updateScheduleItem", (t) =>
  t.prismaField({
    type: "ScheduleItem",
    deprecationReason: "this is a passthrough method",
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      scheduleItemId: t.arg.int({ required: true }),
      input: t.arg({ type: UpdateScheduleItemInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      const scheduleItem = await ctx.prisma.scheduleItem.findFirstOrThrow({
        ...query,
        where: {
          id: args.scheduleItemId,
          organizationId: me.organizationId,
        },
      });

      //TODO: fix the frontend, input is no longer necessary but prevent the linter from screaming
      if (args.input) {
      }

      return scheduleItem;
    },
  }),
);

// ---------------------------------------------------------------------------
// Mutation: resumeLastScheduleItem — resume the last auto-stopped item
// ---------------------------------------------------------------------------

builder.mutationField("resumeLastScheduleItem", (t) =>
  t.prismaField({
    type: "ScheduleItem",
    authScopes: { hasRole: true },
    resolve: async (query, _root, _args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      const scheduleItem = await ctx.prisma.scheduleItem.findFirstOrThrow({
        where: {
          organizationId: me.organizationId,
          roleId: me.roleId,
        },
        orderBy: {
          startedAt: "desc",
        },
      });

      if (await isTicketBlocked(me.organizationId, scheduleItem.ticketId)) {
        throw new GraphQLError("This ticket is blocked", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      if (!scheduleItem.autoStopped) {
        throw new GraphQLError("Only auto stopped tasks can be resumed.", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      return ctx.prisma.scheduleItem.update({
        ...query,
        where: {
          id: scheduleItem.id,
        },
        data: {
          autoStopped: false,
          stoppedAt: null,
          extendedAt: new Date(),
        },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Mutation: closeLastScheduleItem — close/update the last known item for a ticket
// ---------------------------------------------------------------------------

builder.mutationField("closeLastScheduleItem", (t) =>
  t.prismaField({
    type: "ScheduleItem",
    description:
      "Close (or update an already closed) last known ticket workflow state",
    authScopes: { hasRole: true },
    args: {
      ticketId: t.arg.int({ required: true }),
      input: t.arg({ type: CloseScheduleItemInput, required: false }),
    },
    resolve: async (_query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      if (await isTicketBlocked(me.organizationId, args.ticketId)) {
        throw new GraphQLError("This ticket is blocked", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      const lastScheduleItem = await ctx.prisma.scheduleItem.findFirstOrThrow({
        where: {
          ticketId: args.ticketId,
          organizationId: me.organizationId,
        },
        orderBy: {
          stoppedAt: "desc",
        },
      });

      return _closeScheduleItem(ctx, lastScheduleItem, {
        stoppedAt: args.input?.stoppedAt,
        done: args.input?.done,
        note: args.input?.note,
        nextTicketWorkflowStateId: args.input?.nextTicketWorkflowStateId,
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Mutation: closeScheduleItem — close an active workflow state
// ---------------------------------------------------------------------------

builder.mutationField("closeScheduleItem", (t) =>
  t.prismaField({
    type: "ScheduleItem",
    description: "Close an active workflow state",
    authScopes: { hasRole: true },
    args: {
      scheduleItemId: t.arg.int({ required: true }),
      input: t.arg({ type: CloseScheduleItemInput, required: false }),
    },
    resolve: async (_query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      const scheduleItem = await ctx.prisma.scheduleItem.findFirstOrThrow({
        where: {
          id: args.scheduleItemId,
          organizationId: me.organizationId,
          stoppedAt: null,
        },
      });

      if (await isTicketBlocked(me.organizationId, scheduleItem.ticketId)) {
        throw new GraphQLError("This ticket is blocked", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      // Only admin can change someone else's time record
      if (!isAuthorOrAdmin(me, scheduleItem.roleId)) {
        throw new GraphQLError(
          "Only the assignee or an admin can change this information",
          { extensions: { code: "BAD_USER_INPUT" } },
        );
      }

      return _closeScheduleItem(ctx, scheduleItem, {
        stoppedAt: args.input?.stoppedAt,
        done: args.input?.done,
        note: args.input?.note,
        nextTicketWorkflowStateId: args.input?.nextTicketWorkflowStateId,
      });
    },
  }),
);

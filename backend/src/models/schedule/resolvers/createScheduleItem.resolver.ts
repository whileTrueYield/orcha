/**
 * Mutation: createScheduleItem — start or backfill a work record.
 */

import builder from "../../../schema/builder";
import { GraphQLError } from "graphql";
import { TicketStatus } from "@prisma/client";
import { assertCanScheduleTicket } from "../../ticket/resolvers/scheduleTicket.resolver";
import { requestEstimate } from "../../ticket/jobs/estimateTickets";
import { subDays } from "date-fns";
import { isTicketBlocked } from "../../ticket/helper";
import { AuthRoleContext } from "../../../types";

const CreateScheduleItemInput = builder.inputType("CreateScheduleItemInput", {
  fields: (t) => ({
    startedAt: t.string({ required: false }),
    stoppedAt: t.string({ required: false }),
    ticketId: t.int({ required: true }),
    ticketWorkflowStateId: t.int({ required: true }),
  }),
});

builder.mutationField("createScheduleItem", (t) =>
  t.prismaField({
    type: "ScheduleItem",
    authScopes: { hasRole: true },
    args: {
      input: t.arg({ type: CreateScheduleItemInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const now = new Date();
      const nowStr = now.toISOString();
      const startedAt = args.input.startedAt || nowStr;

      if (startedAt > nowStr) {
        throw new GraphQLError("The start date cannot be in the future.", { extensions: { code: "BAD_USER_INPUT" } });
      }
      if (args.input.stoppedAt && args.input.stoppedAt > nowStr) {
        throw new GraphQLError("The stop date cannot be in the future.", { extensions: { code: "BAD_USER_INPUT" } });
      }
      if (startedAt < subDays(now, 30).toISOString()) {
        throw new GraphQLError("The start date needs to be within the past 30 days.", { extensions: { code: "BAD_USER_INPUT" } });
      }
      if (await isTicketBlocked((ctx.me as AuthRoleContext).organizationId, args.input.ticketId)) {
        throw new GraphQLError("This ticket is blocked", { extensions: { code: "BAD_USER_INPUT" } });
      }

      const ticket = await ctx.prisma.ticket.findFirstOrThrow({
        where: {
          id: args.input.ticketId,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
          status: { in: [TicketStatus.SCHEDULED, TicketStatus.CANCELLED, TicketStatus.DONE] },
        },
        include: { ticketWorkflowStates: true },
      });

      if (ticket.status !== "SCHEDULED" && ticket.closedAt) {
        if (startedAt > ticket.closedAt.toISOString()) {
          throw new GraphQLError("The start date cannot be after the closing date of the ticket.", { extensions: { code: "BAD_USER_INPUT" } });
        }
        if (args.input.stoppedAt && args.input.stoppedAt > ticket.closedAt.toISOString()) {
          throw new GraphQLError("The stop date cannot be after the closing date of the ticket.", { extensions: { code: "BAD_USER_INPUT" } });
        }
      }

      const ticketWorkflowState = await ctx.prisma.ticketWorkflowState.findFirstOrThrow({
        where: { ticketId: ticket.id, id: args.input.ticketWorkflowStateId },
      });

      const unfinishedScheduleItem = await ctx.prisma.scheduleItem.findFirst({
        where: {
          roleId: (ctx.me as AuthRoleContext).roleId,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
          ticketWorkflowStateId: ticketWorkflowState.id,
          stoppedAt: null,
        },
      });

      if (unfinishedScheduleItem) {
        return unfinishedScheduleItem;
      }

      if (args.input.stoppedAt) {
        const overlapping = await ctx.prisma.scheduleItem.findFirst({
          where: {
            roleId: (ctx.me as AuthRoleContext).roleId,
            organizationId: (ctx.me as AuthRoleContext).organizationId,
            startedAt: { lt: args.input.stoppedAt },
            OR: [{ stoppedAt: null }, { stoppedAt: { gt: startedAt } }],
          },
        });
        if (overlapping) throw new GraphQLError("There is an overlap in your task schedule", { extensions: { code: "BAD_USER_INPUT" } });
      } else {
        const overlapping = await ctx.prisma.scheduleItem.findFirst({
          where: {
            roleId: (ctx.me as AuthRoleContext).roleId,
            organizationId: (ctx.me as AuthRoleContext).organizationId,
            OR: [{ stoppedAt: { gt: startedAt } }],
          },
        });
        if (overlapping) throw new GraphQLError("There is an overlap in your task schedule", { extensions: { code: "BAD_USER_INPUT" } });
      }

      await requestEstimate((ctx.me as AuthRoleContext).organizationId);

      if (ticket.status !== TicketStatus.SCHEDULED) {
        assertCanScheduleTicket(ticket, ticket.ticketWorkflowStates);
        await ctx.prisma.ticket.update({
          where: { id: ticket.id },
          data: { status: TicketStatus.SCHEDULED, scheduledAt: ticket.scheduledAt || new Date() },
        });
      }

      if (!args.input.stoppedAt) {
        await ctx.prisma.scheduleItem.updateMany({
          where: {
            roleId: (ctx.me as AuthRoleContext).roleId,
            organizationId: (ctx.me as AuthRoleContext).organizationId,
            ticketId: ticketWorkflowState.ticketId,
            ticketWorkflowStateId: { not: ticketWorkflowState.id },
            stoppedAt: null,
          },
          data: { stoppedAt: nowStr, done: false },
        });

        await ctx.prisma.scheduleItem.updateMany({
          where: {
            roleId: (ctx.me as AuthRoleContext).roleId,
            organizationId: (ctx.me as AuthRoleContext).organizationId,
            stoppedAt: null,
          },
          data: { stoppedAt: nowStr, done: false },
        });
      }

      return ctx.prisma.scheduleItem.create({
        ...query,
        data: {
          roleId: (ctx.me as AuthRoleContext).roleId,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
          ticketWorkflowStateId: ticketWorkflowState.id,
          ticketId: ticket.id,
          startedAt,
          stoppedAt: args.input.stoppedAt ?? undefined,
          done: false,
        },
      });
    },
  }),
);

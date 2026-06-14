/**
 * Mutation: advanceTicketWorkflowState — move a ticket through its workflow in
 * one call, the agent-friendly counterpart to the human closeScheduleItem flow.
 *
 * Registers: Mutation.advanceTicketWorkflowState(ticketId, toTicketWorkflowStateId?, note?): Ticket
 *
 * Given the caller's current stage on a SCHEDULED ticket, this resolves the
 * target stage (explicit, or the next one by position) and records the handoff
 * — reusing _closeScheduleItem so the DONE/handoff/note transitions never
 * diverge from the schedule-item mutations. Completing the last stage marks the
 * whole ticket DONE.
 *
 * Non-obvious assumptions:
 *  - The caller's "current stage" is either their open scheduleItem's stage, or
 *    the lowest-position active state assigned to them. We must always close a
 *    real scheduleItem row through _closeScheduleItem (it keys updates and notes
 *    off scheduleItem.id), so when the caller has no open work we first create a
 *    just-now-started item to carry the handoff and capture the time window.
 *  - Tenant scoping is enforced on every read via me.organizationId.
 */

import builder from "../../../schema/builder";
import { GraphQLError } from "graphql";
import { ModelStage, TicketStatus } from "@prisma/client";
import { AuthRoleContext } from "../../../types";
import { _closeScheduleItem } from "../../schedule/resolvers/updateScheduleItem.resolver";

builder.mutationField("advanceTicketWorkflowState", (t) =>
  t.prismaField({
    type: "Ticket",
    description:
      "Advance a scheduled ticket to its next (or an explicit) workflow stage in one call, recording the handoff and an optional note.",
    authScopes: { hasRole: true },
    args: {
      ticketId: t.arg.int({ required: true }),
      toTicketWorkflowStateId: t.arg.int({ required: false }),
      note: t.arg.string({ required: false }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      // 1. Load the ticket tenant-scoped; it must be in a workable state.
      const ticket = await ctx.prisma.ticket.findFirst({
        where: {
          id: args.ticketId,
          organizationId: me.organizationId,
        },
        include: { ticketWorkflowStates: true },
      });

      if (!ticket) {
        throw new GraphQLError("No Ticket found.", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      if (
        ticket.stage !== ModelStage.PUBLISHED ||
        ticket.status !== TicketStatus.SCHEDULED
      ) {
        throw new GraphQLError("Only a scheduled ticket can be advanced.", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      // 2. Determine the caller's CURRENT stage on this ticket.
      const openScheduleItem = await ctx.prisma.scheduleItem.findFirst({
        where: {
          ticketId: ticket.id,
          organizationId: me.organizationId,
          roleId: me.roleId,
          stoppedAt: null,
        },
      });

      let currentStateId: number;
      if (openScheduleItem) {
        currentStateId = openScheduleItem.ticketWorkflowStateId;
      } else {
        // No clock running. A prior handoff (a closed item pointing forward via
        // nextTicketWorkflowStateId) already moved the work to a later stage, so
        // that target is the current stage — mirroring getTicketCurrentState.
        // Only when no work has been recorded do we fall back to the lowest
        // active state assigned to the caller.
        const lastItem = await ctx.prisma.scheduleItem.findFirst({
          where: {
            ticketId: ticket.id,
            organizationId: me.organizationId,
          },
          orderBy: { startedAt: "desc" },
        });

        if (lastItem?.nextTicketWorkflowStateId) {
          currentStateId = lastItem.nextTicketWorkflowStateId;
        } else {
          const activeState = await ctx.prisma.ticketWorkflowState.findFirst({
            where: {
              ticketId: ticket.id,
              isActive: true,
              assigneeId: me.roleId,
            },
            orderBy: { position: "asc" },
          });
          if (!activeState) {
            throw new GraphQLError(
              "You have no active stage to advance on this ticket.",
              { extensions: { code: "BAD_USER_INPUT" } },
            );
          }
          currentStateId = activeState.id;
        }
      }

      const currentState = ticket.ticketWorkflowStates.find(
        (state) => state.id === currentStateId,
      );
      // currentStateId came from a row on this ticket, so this is defensive.
      if (!currentState) {
        throw new GraphQLError(
          "You have no active stage to advance on this ticket.",
          { extensions: { code: "BAD_USER_INPUT" } },
        );
      }

      // 3. Determine the TARGET stage.
      let targetStateId: number | null;
      if (args.toTicketWorkflowStateId != null) {
        const target = ticket.ticketWorkflowStates.find(
          (state) => state.id === args.toTicketWorkflowStateId,
        );
        if (!target) {
          throw new GraphQLError(
            "No TicketWorkflowState found on this ticket.",
            { extensions: { code: "BAD_USER_INPUT" } },
          );
        }
        targetStateId = target.id;
      } else {
        // "next in line": smallest position strictly greater than current's.
        const nextState = ticket.ticketWorkflowStates
          .filter((state) => state.position > currentState.position)
          .sort((a, b) => a.position - b.position)[0];
        targetStateId = nextState ? nextState.id : null;
      }

      // 4. Apply. We always close a real scheduleItem row through
      // _closeScheduleItem so DONE/handoff/note logic stays unified; when the
      // caller had no open work we materialize a just-now item to carry it.
      const scheduleItem =
        openScheduleItem ??
        (await ctx.prisma.scheduleItem.create({
          data: {
            roleId: me.roleId,
            organizationId: me.organizationId,
            ticketId: ticket.id,
            ticketWorkflowStateId: currentStateId,
            startedAt: new Date(),
          },
        }));

      // _closeScheduleItem re-estimates internally on its done branch (both
      // handoff and last-stage), so we do not call requestEstimate again here.
      await _closeScheduleItem(ctx, scheduleItem, {
        done: true,
        note: args.note,
        nextTicketWorkflowStateId: targetStateId ?? undefined,
      });

      return ctx.prisma.ticket.findUniqueOrThrow({
        ...query,
        where: { id: ticket.id },
      });
    },
  }),
);

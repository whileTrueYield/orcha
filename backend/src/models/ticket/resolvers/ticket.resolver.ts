/**
 * Single-ticket query and computed field resolvers.
 *
 * Registers:
 *  - Query.ticket(id, visited?): Ticket!
 *  - Query.ticketNotes(ticketId): [TicketWorkflowStateNote!]!
 *  - Query.lastTicketWorkflowStateNote(ticketId): TicketWorkflowStateNote
 *
 * Also registers computed prismaObject fields on the Ticket type:
 *  - isWatching: whether the current user watches this ticket
 *  (the body lives on the `body` field — see ticketBody.resolver.ts)
 *
 * Relation fields (organization, product, author, owner, workflow, project,
 * ticketWorkflowStates, ancestors, successors, tags, watchers, personalTags,
 * scheduleItems, etc.) are handled by the Pothos prismaObject relations
 * defined in entity.ts.
 */

import { ModelStage, TicketStatus } from "@prisma/client";
import { find, last, without } from "lodash";
import builder from "../../../schema/builder";
import { TicketWorkflowStateRef } from "../entity";
import { ScheduleItemRef } from "../../schedule/entity";
import { AuthRoleContext } from "../../../types";
import { getRolePreferences, updateRolePreferences } from "../../entities";

// ---------------------------------------------------------------------------
// Query: ticket
// ---------------------------------------------------------------------------

builder.queryField("ticket", (t) =>
  t.prismaField({
    type: "Ticket",
    authScopes: { hasRole: true },
    args: {
      id: t.arg.int({ required: true }),
      visited: t.arg.boolean({ required: false }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      const ticket = await ctx.prisma.ticket.findFirstOrThrow({
        ...query,
        where: {
          id: args.id,
          organizationId: me.organizationId,
          stage: { not: ModelStage.DELETED },
        },
        include: {
          ...query.include,
          organization: true,
          features: { include: { featureGroup: true } },
          project: true,
          author: true,
          owner: true,
          watchers: true,
          product: true,
          workflow: true,
          ticketWorkflowStates: {
            orderBy: { position: "asc" },
            include: {
              scheduleItems: { include: { role: true } },
              workflowState: true,
              assignee: true,
            },
          },
        },
      });

      // Track recently visited tickets for the user's role
      if (args.visited) {
        const role = await me.getRole();
        const preferences = getRolePreferences(role);
        const objectId = `ticket:${args.id}:${(ticket as any).product?.code || ""}:${
          ticket.localId || ""
        }:${ticket.title}`;

        const recentlyVisited = [
          objectId,
          ...without(preferences.recentlyVisited, objectId),
        ];

        const updatedPreferences = updateRolePreferences(role, {
          recentlyVisited: recentlyVisited.slice(0, 10),
        });

        await ctx.prisma.role.update({
          where: { id: me.roleId },
          data: { preferences: JSON.stringify(updatedPreferences) },
        });
      }

      return ticket;
    },
  }),
);

// ---------------------------------------------------------------------------
// Query: ticketNotes
// ---------------------------------------------------------------------------

builder.queryField("ticketNotes", (t) =>
  t.prismaField({
    type: ["TicketWorkflowStateNote"],
    authScopes: { hasRole: true },
    args: {
      ticketId: t.arg.int({ required: true }),
    },
    resolve: (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;
      return ctx.prisma.ticketWorkflowStateNote.findMany({
        ...query,
        where: {
          ticketWorkflowState: {
            ticket: {
              organizationId: me.organizationId,
              id: args.ticketId,
            },
          },
        },
        include: {
          ...query.include,
          author: true,
          fromTicketWorkflowState: true,
          ticketWorkflowState: true,
        },
        orderBy: { createdAt: "desc" },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Query: lastTicketWorkflowStateNote
// ---------------------------------------------------------------------------

builder.queryField("lastTicketWorkflowStateNote", (t) =>
  t.prismaField({
    type: "TicketWorkflowStateNote",
    nullable: true,
    authScopes: { hasRole: true },
    args: {
      ticketId: t.arg.int({ required: true }),
    },
    resolve: (query, _root, args, _ctx) =>
      _ctx.prisma.ticketWorkflowStateNote.findFirst({
        ...query,
        where: {
          ticketWorkflowState: { ticketId: args.ticketId },
        },
        orderBy: { createdAt: "desc" },
      }),
  }),
);

// ---------------------------------------------------------------------------
// Computed field: isWatching — whether the current user watches this ticket
// ---------------------------------------------------------------------------

builder.prismaObjectField("Ticket", "isWatching", (t) =>
  t.boolean({
    authScopes: { hasRole: true },
    resolve: async (ticket, _args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      if ((ticket as any).watchers) {
        return !!find((ticket as any).watchers, { id: me.roleId });
      }

      return !!(await ctx.prisma.ticket.findFirst({
        where: {
          id: ticket.id,
          watchers: { some: { id: me.roleId } },
        },
      }));
    },
  }),
);

// The ticket body is exposed through the `body` field (Markdown + version) on
// the Ticket type — see ticketBody.resolver.ts. The former `description`
// computed field (which reconstructed TipTap JSON from a Yjs byte array) is
// retired with the move to Markdown-as-source-of-truth (ADR 0007).

// ---------------------------------------------------------------------------
// Computed field: lastScheduleItem — the most recent schedule item for this ticket
// ---------------------------------------------------------------------------

builder.prismaObjectField("Ticket", "lastScheduleItem", (t) =>
  t.field({
    type: ScheduleItemRef,
    nullable: true,
    resolve: async (ticket, _args, ctx) => {
      if ((ticket as any).scheduleItems) {
        return last((ticket as any).scheduleItems) || null;
      }

      return ctx.prisma.scheduleItem.findFirst({
        where: { ticketId: ticket.id },
        orderBy: { stoppedAt: "desc" },
        include: { ticketWorkflowState: true },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Computed field: state — the current workflow state of a scheduled ticket
//
// Only published+scheduled tickets have a meaningful current state.
// Derived from the last schedule item's next or current workflow state,
// or falls back to the first active workflow state.
// ---------------------------------------------------------------------------

builder.prismaObjectField("Ticket", "state", (t) =>
  t.field({
    type: TicketWorkflowStateRef,
    nullable: true,
    resolve: async (ticket, _args, ctx) => {
      if (
        ticket.stage === ModelStage.PUBLISHED &&
        ticket.status === TicketStatus.SCHEDULED
      ) {
        // Resolve lastScheduleItem inline
        const lastSI: any = (ticket as any).scheduleItems
          ? last((ticket as any).scheduleItems)
          : await ctx.prisma.scheduleItem.findFirst({
              where: { ticketId: ticket.id },
              orderBy: { stoppedAt: "desc" },
              include: {
                ticketWorkflowState: true,
                nextTicketWorkflowState: true,
              },
            });

        if (lastSI) {
          if (lastSI.nextTicketWorkflowStateId) {
            if (lastSI.nextTicketWorkflowState) {
              return lastSI.nextTicketWorkflowState;
            }
            return ctx.prisma.ticketWorkflowState.findUnique({
              where: { id: lastSI.nextTicketWorkflowStateId },
            });
          }

          if (lastSI.ticketWorkflowState) {
            return lastSI.ticketWorkflowState;
          }

          return ctx.prisma.ticketWorkflowState.findUnique({
            where: { id: lastSI.ticketWorkflowStateId },
          });
        }

        return ctx.prisma.ticketWorkflowState.findFirst({
          where: { isActive: true, ticket: { id: ticket.id } },
          orderBy: { position: "asc" },
        });
      }

      return null;
    },
  }),
);

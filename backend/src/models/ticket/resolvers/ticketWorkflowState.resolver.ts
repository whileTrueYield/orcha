/**
 * Query and mutation resolvers for TicketWorkflowState.
 *
 * Registers:
 *  - Query.ticketWorkflowState(id): TicketWorkflowState!
 *  - Mutation.setChecklist(ticketWorkflowStateId, input): TicketWorkflowState!
 *  - Mutation.skipTicketWorkflowState(id): TicketWorkflowState!
 *
 * The checklist is stored as a JSON string on the TicketWorkflowState model.
 * setChecklist also computes todo/complete counts for quick aggregation.
 */

import { EstimateType, ModelStage } from "@prisma/client";
import { partition } from "lodash";
import builder from "../../../schema/builder";
import { EstimateRef } from "../../schedule/resolvers/estimate.resolver";
import { ChecklistItemRef } from "../entity";
import { AuthRoleContext } from "../../../types";

// ---------------------------------------------------------------------------
// Input type for checklist items
// ---------------------------------------------------------------------------

const UpdateChecklistInput = builder.inputType("UpdateChecklistInput", {
  fields: (t) => ({
    label: t.string({ required: true }),
    checked: t.boolean({ required: false }),
  }),
});

// ---------------------------------------------------------------------------
// Query: ticketWorkflowState
// ---------------------------------------------------------------------------

builder.queryField("ticketWorkflowState", (t) =>
  t.prismaField({
    type: "TicketWorkflowState",
    authScopes: { hasRole: true },
    args: {
      id: t.arg.int({ required: true }),
    },
    resolve: (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;
      return ctx.prisma.ticketWorkflowState.findFirstOrThrow({
        ...query,
        where: {
          id: args.id,
          workflowState: {
            organizationId: me.organizationId,
          },
        },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Mutation: setChecklist
// ---------------------------------------------------------------------------

builder.mutationField("setChecklist", (t) =>
  t.prismaField({
    type: "TicketWorkflowState",
    authScopes: { hasRole: true },
    args: {
      ticketWorkflowStateId: t.arg.int({ required: true }),
      input: t.arg({ type: [UpdateChecklistInput], required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      const ticketWorkflowState =
        await ctx.prisma.ticketWorkflowState.findFirstOrThrow({
          where: {
            id: args.ticketWorkflowStateId,
            ticket: {
              stage: { not: ModelStage.DELETED },
              organizationId: me.organizationId,
            },
          },
          include: { ticket: true },
        });

      // Extract progress counts for quick stats
      const [completedItems, todoItems] = partition(args.input, {
        checked: true,
      });

      return ctx.prisma.ticketWorkflowState.update({
        ...query,
        where: { id: ticketWorkflowState.id },
        data: {
          todo: todoItems.length,
          complete: completedItems.length,
          checklist: JSON.stringify(args.input),
        },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Mutation: skipTicketWorkflowState
// ---------------------------------------------------------------------------

builder.mutationField("skipTicketWorkflowState", (t) =>
  t.prismaField({
    type: "TicketWorkflowState",
    authScopes: { hasRole: true },
    args: {
      id: t.arg.int({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      const tws = await ctx.prisma.ticketWorkflowState.findFirstOrThrow({
        where: {
          id: args.id,
          ticket: {
            organizationId: me.organizationId,
            stage: ModelStage.PUBLISHED,
          },
        },
      });

      return ctx.prisma.ticketWorkflowState.update({
        ...query,
        where: { id: tws.id },
        data: { isActive: false },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Computed field: estimateSet — the latest Estimate for this workflow state
// ---------------------------------------------------------------------------

builder.prismaObjectField("TicketWorkflowState", "estimateSet", (t) =>
  t.field({
    type: EstimateRef,
    nullable: true,
    resolve: (tws, _args, ctx) =>
      ctx.prisma.estimate.findFirst({
        where: {
          type: EstimateType.TicketWorkflowState,
          id: tws.id,
        },
        orderBy: { epoch: "desc" },
      }),
  }),
);

// ---------------------------------------------------------------------------
// Computed field: checklist — parsed from JSON string on TicketWorkflowState
// ---------------------------------------------------------------------------

builder.prismaObjectField("TicketWorkflowState", "checklist", (t) =>
  t.field({
    type: [ChecklistItemRef],
    resolve: (tws) => {
      try {
        return JSON.parse((tws as any).checklist as string) || [];
      } catch {
        return [];
      }
    },
  }),
);

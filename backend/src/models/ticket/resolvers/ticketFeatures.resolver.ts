/**
 * Mutation resolvers for managing ticket-feature associations.
 *
 * Registers:
 *  - Mutation.addTicketFeatures(ticketId, featureIds): Ticket!
 *  - Mutation.removeTicketFeatures(ticketId, featureIds): Ticket!
 *
 * Features can only be associated with tickets that share the same product.
 */

import { GraphQLError } from "graphql";
import { ModelStage } from "@prisma/client";
import builder from "../../../schema/builder";
import { AuthRoleContext } from "../../../types";

// ---------------------------------------------------------------------------
// Mutation: addTicketFeatures
// ---------------------------------------------------------------------------

builder.mutationField("addTicketFeatures", (t) =>
  t.prismaField({
    type: "Ticket",
    authScopes: { hasRole: true },
    args: {
      ticketId: t.arg.int({ required: true }),
      featureIds: t.arg.intList({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      const ticket = await ctx.prisma.ticket.findFirstOrThrow({
        where: {
          id: args.ticketId,
          organizationId: me.organizationId,
          stage: { in: [ModelStage.PUBLISHED, ModelStage.DRAFT] },
        },
      });

      if (!ticket.productId) {
        throw new GraphQLError("Ticket does not have a product");
      }

      // Only associate features that belong to the same product
      const features = await ctx.prisma.feature.findMany({
        select: { id: true },
        where: {
          id: { in: args.featureIds },
          featureGroup: {
            productId: ticket.productId,
          },
        },
      });

      return ctx.prisma.ticket.update({
        ...query,
        where: { id: ticket.id },
        data: {
          features: {
            connect: features.map(({ id }) => ({ id })),
          },
        },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Mutation: removeTicketFeatures
// ---------------------------------------------------------------------------

builder.mutationField("removeTicketFeatures", (t) =>
  t.prismaField({
    type: "Ticket",
    authScopes: { hasRole: true },
    args: {
      ticketId: t.arg.int({ required: true }),
      featureIds: t.arg.intList({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      const ticket = await ctx.prisma.ticket.findFirstOrThrow({
        where: {
          id: args.ticketId,
          organizationId: me.organizationId,
          stage: { in: [ModelStage.PUBLISHED, ModelStage.DRAFT] },
        },
      });

      return ctx.prisma.ticket.update({
        ...query,
        where: { id: ticket.id },
        data: {
          features: {
            disconnect: args.featureIds.map((id) => ({ id })),
          },
        },
      });
    },
  }),
);

/**
 * Query and mutation resolvers for a single Product.
 *
 * Registers:
 *  - Query.product(id: Int!): Product!
 *  - Mutation.addFeatureGroup(productId, name): Product!
 *  - Mutation.addWorkflows(productId, workflowIds): Product!
 *  - Mutation.removeWorkflows(productId, workflowIds): Product!
 *
 * All require at least a linked role; mutations require ADMIN or OWNER.
 */

import { GraphQLError } from "graphql";
import { FeatureGroupStatus } from "@prisma/client";
import { trim } from "lodash";
import builder from "../../../schema/builder";
import { ProductRef } from "../entity";
import { PaginatedFeatures } from "../../feature/entity";
import { PaginatedTickets } from "../../ticket/entity";
import { getPaginatedFeatures } from "../../feature/helper";
import { getPaginatedTickets } from "../../ticket/helper";
import { AuthRoleContext } from "../../../types";

// ---------------------------------------------------------------------------
// Query
// ---------------------------------------------------------------------------

builder.queryField("product", (t) =>
  t.prismaField({
    type: ProductRef,
    authScopes: { hasRole: true },
    args: {
      id: t.arg.int({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const product = await ctx.prisma.product.findFirst({
        ...query,
        where: {
          id: args.id,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
        },
      });

      if (!product) {
        throw new GraphQLError(
          "This product does not exist or has been deleted",
        );
      }

      return product;
    },
  }),
);

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

builder.mutationField("addFeatureGroup", (t) =>
  t.prismaField({
    type: ProductRef,
    authScopes: { hasRole: ["OWNER", "ADMIN"] },
    args: {
      productId: t.arg.int({ required: true }),
      name: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const product = await ctx.prisma.product.findFirst({
        where: {
          id: args.productId,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
        },
      });

      if (!product) {
        throw new GraphQLError(
          "This product does not exist or has been deleted",
        );
      }

      const existing = await ctx.prisma.featureGroup.findFirst({
        where: {
          name: {
            equals: trim(args.name.toLowerCase()),
            mode: "insensitive",
          },
          organizationId: (ctx.me as AuthRoleContext).organizationId,
          productId: args.productId,
        },
      });

      if (existing) {
        throw new GraphQLError("This feature already exists");
      }

      await ctx.prisma.featureGroup.create({
        data: {
          name: args.name,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
          productId: args.productId,
          status: FeatureGroupStatus.ACTIVE,
        },
      });

      // Re-fetch with query includes for Pothos
      return ctx.prisma.product.findUniqueOrThrow({
        ...query,
        where: { id: product.id },
      });
    },
  }),
);

builder.mutationField("addWorkflows", (t) =>
  t.prismaField({
    type: ProductRef,
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      productId: t.arg.int({ required: true }),
      workflowIds: t.arg.intList({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const product = await ctx.prisma.product.findFirstOrThrow({
        where: {
          id: args.productId,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
        },
      });

      return ctx.prisma.product.update({
        ...query,
        where: { id: product.id },
        data: {
          workflows: {
            connect: args.workflowIds.map((id) => ({ id })),
          },
        },
      });
    },
  }),
);

builder.mutationField("removeWorkflows", (t) =>
  t.prismaField({
    type: ProductRef,
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      productId: t.arg.int({ required: true }),
      workflowIds: t.arg.intList({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const product = await ctx.prisma.product.findFirstOrThrow({
        where: {
          id: args.productId,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
        },
      });

      return ctx.prisma.product.update({
        ...query,
        where: { id: product.id },
        data: {
          workflows: {
            disconnect: args.workflowIds.map((id) => ({ id })),
          },
        },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Computed field: features — paginated features belonging to this product
// ---------------------------------------------------------------------------

builder.prismaObjectField("Product", "features", (t) =>
  t.field({
    type: PaginatedFeatures,
    authScopes: { hasRole: true },
    args: {
      first: t.arg.int({ required: false }),
      last: t.arg.int({ required: false }),
      offset: t.arg.int({ required: false }),
      sort: t.arg.string({ required: false }),
      search: t.arg.string({ required: false }),
    },
    resolve: (product, args, ctx) =>
      getPaginatedFeatures({
        productId: product.id,
        organizationId: (ctx.me as AuthRoleContext).organizationId,
        first: args.first ?? undefined,
        last: args.last ?? undefined,
        offset: args.offset ?? undefined,
        sort: args.sort as any,
        search: args.search ?? undefined,
      }),
  }),
);

// ---------------------------------------------------------------------------
// Computed field: tickets — paginated tickets belonging to this product
// ---------------------------------------------------------------------------

builder.prismaObjectField("Product", "tickets", (t) =>
  t.field({
    type: PaginatedTickets,
    authScopes: { hasRole: true },
    args: {
      first: t.arg.int({ required: false }),
      last: t.arg.int({ required: false }),
      offset: t.arg.int({ required: false }),
      sort: t.arg.string({ required: false }),
      search: t.arg.string({ required: false }),
    },
    resolve: (product, args, ctx) =>
      getPaginatedTickets({
        productId: product.id,
        organizationId: (ctx.me as AuthRoleContext).organizationId,
        first: args.first ?? undefined,
        last: args.last ?? undefined,
        offset: args.offset ?? undefined,
        sort: args.sort as any,
        search: args.search ?? undefined,
      }),
  }),
);

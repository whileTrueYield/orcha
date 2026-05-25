/**
 * Mutation resolvers for updating a Product.
 *
 * Registers:
 *  - Mutation.updateProductStage(productId, stage): Product!
 *  - Mutation.updateProductUseGlobalWorkflow(productId, useDefaultWorkflows): Product!
 *  - Mutation.updateProduct(productId, input): Product!
 *
 * All require ADMIN or OWNER role.
 */

import { GraphQLError } from "graphql";
import { ModelStage } from "@prisma/client";
import builder from "../../../schema/builder";
import { ModelStageEnum } from "../../../schema/enums";
import { ProductRef } from "../entity";
import { findProductByCode } from "../helper";
import { AuthRoleContext } from "../../../types";

// ---------------------------------------------------------------------------
// Input type
// ---------------------------------------------------------------------------

const UpdateProductInput = builder.inputType("UpdateProductInput", {
  fields: (t) => ({
    name: t.string({ required: false }),
    code: t.string({ required: false }),
    description: t.string({ required: false }),
    coverUrl: t.string({ required: false }),
    isSupportActive: t.boolean({ required: false }),
  }),
});

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

builder.mutationField("updateProductStage", (t) =>
  t.prismaField({
    type: ProductRef,
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      productId: t.arg.int({ required: true }),
      stage: t.arg({ type: ModelStageEnum, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const product = await ctx.prisma.product.findFirstOrThrow({
        where: {
          id: args.productId,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
          stage: { not: ModelStage.DELETED },
        },
      });

      const allowedTransitions: Record<string, ModelStage[]> = {
        [ModelStage.DRAFT]: [ModelStage.DELETED, ModelStage.PUBLISHED],
        [ModelStage.ARCHIVED]: [ModelStage.DELETED, ModelStage.PUBLISHED],
        [ModelStage.PUBLISHED]: [ModelStage.DELETED, ModelStage.ARCHIVED],
      };

      const stage = args.stage as ModelStage;

      if (
        stage in allowedTransitions &&
        allowedTransitions[stage].indexOf(product.stage) !== -1
      ) {
        return ctx.prisma.product.update({
          ...query,
          where: { id: product.id },
          data: { stage },
        });
      }

      throw new GraphQLError(
        `Cannot go from ${product.stage} to ${stage}`,
      );
    },
  }),
);

builder.mutationField("updateProductUseGlobalWorkflow", (t) =>
  t.prismaField({
    type: ProductRef,
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      productId: t.arg.int({ required: true }),
      useDefaultWorkflows: t.arg.boolean({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const product = await ctx.prisma.product.findFirstOrThrow({
        where: {
          id: args.productId,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
          stage: { not: ModelStage.DELETED },
        },
      });

      if (product.stage === ModelStage.ARCHIVED) {
        throw new GraphQLError("Cannot edit an archived product");
      }

      return ctx.prisma.product.update({
        ...query,
        where: { id: product.id },
        data: { isUsingDefaultWorkflows: args.useDefaultWorkflows },
      });
    },
  }),
);

builder.mutationField("updateProduct", (t) =>
  t.prismaField({
    type: ProductRef,
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      productId: t.arg.int({ required: true }),
      input: t.arg({ type: UpdateProductInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const product = await ctx.prisma.product.findFirstOrThrow({
        where: {
          organizationId: (ctx.me as AuthRoleContext).organizationId,
          id: args.productId,
          stage: { not: ModelStage.DELETED },
        },
      });

      if (product.stage === ModelStage.ARCHIVED) {
        throw new GraphQLError("Cannot edit an archived product");
      }

      // Prevent code collisions when the product code is being changed
      if (args.input.code && args.input.code !== product.code) {
        const existing = await findProductByCode(
          args.input.code,
          (ctx.me as AuthRoleContext).organizationId,
        );

        if (existing && existing.id !== product.id) {
          throw new GraphQLError(
            "A product with the same code already exists",
          );
        }
      }

      return ctx.prisma.product.update({
        ...query,
        where: { id: product.id },
        data: {
          name: args.input.name ?? undefined,
          code: args.input.code ?? undefined,
          description: args.input.description ?? undefined,
          coverUrl: args.input.coverUrl ?? undefined,
          isSupportActive: args.input.isSupportActive ?? undefined,
        },
      });
    },
  }),
);

/**
 * Mutation resolver for creating a new Product.
 *
 * Registers: Mutation.createProduct(input: CreateProductInput!): Product!
 *
 * Requires ADMIN or OWNER role. Validates that no product with the
 * same code already exists in the organisation.
 */

import { GraphQLError } from "graphql";
import { ModelStage } from "@prisma/client";
import builder from "../../../schema/builder";
import { ProductRef } from "../entity";
import { findProductByCode } from "../helper";
import { AuthRoleContext } from "../../../types";

// ---------------------------------------------------------------------------
// Input type
// ---------------------------------------------------------------------------

const CreateProductInput = builder.inputType("CreateProductInput", {
  fields: (t) => ({
    name: t.string({ required: true }),
    code: t.string({ required: true }),
    description: t.string({ required: false }),
  }),
});

// ---------------------------------------------------------------------------
// Mutation
// ---------------------------------------------------------------------------

builder.mutationField("createProduct", (t) =>
  t.prismaField({
    type: ProductRef,
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      input: t.arg({ type: CreateProductInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const existing = await findProductByCode(
        args.input.code,
        (ctx.me as AuthRoleContext).organizationId,
      );

      if (existing) {
        throw new GraphQLError(
          "A product with the same code already exists",
        );
      }

      return ctx.prisma.product.create({
        ...query,
        data: {
          name: args.input.name,
          code: args.input.code,
          description: args.input.description ?? undefined,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
          stage: ModelStage.PUBLISHED,
        },
      });
    },
  }),
);

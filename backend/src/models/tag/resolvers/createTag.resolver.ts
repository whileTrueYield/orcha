/**
 * Mutation resolver for creating a new organisation-level Tag.
 *
 * Registers: Mutation.createTag(input: CreateTagInput!): Tag!
 *
 * Requires ADMIN or OWNER role. Validates that no tag with the
 * same name (case-insensitive) already exists in the organisation.
 */

import { GraphQLError } from "graphql";
import builder from "../../../schema/builder";
import { TagRef } from "../entity";
import { findTagByName } from "../helper";
import { AuthRoleContext } from "../../../types";

// ---------------------------------------------------------------------------
// Input type
// ---------------------------------------------------------------------------

const CreateTagInput = builder.inputType("CreateTagInput", {
  fields: (t) => ({
    name: t.string({ required: true }),
    color: t.string({ required: true }),
  }),
});

// ---------------------------------------------------------------------------
// Mutation
// ---------------------------------------------------------------------------

builder.mutationField("createTag", (t) =>
  t.prismaField({
    type: TagRef,
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      input: t.arg({ type: CreateTagInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const existing = await findTagByName(
        args.input.name,
        (ctx.me as AuthRoleContext).organizationId,
      );

      if (existing) {
        throw new GraphQLError("A tag with the same name already exists");
      }

      return ctx.prisma.tag.create({
        ...query,
        data: {
          name: args.input.name,
          color: args.input.color,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
          authorId: (ctx.me as AuthRoleContext).roleId,
        },
      });
    },
  }),
);

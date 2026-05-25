/**
 * Mutation resolver for updating an existing organisation-level Tag.
 *
 * Registers: Mutation.updateTag(tagId: Int!, input: UpdateTagInput!): Tag!
 *
 * Requires ADMIN or OWNER role. When the name changes, validates
 * that no other tag in the organisation already uses that name
 * (case-insensitive).
 */

import { GraphQLError } from "graphql";
import builder from "../../../schema/builder";
import { TagRef } from "../entity";
import { findTagByName } from "../helper";
import { AuthRoleContext } from "../../../types";

// ---------------------------------------------------------------------------
// Input type
// ---------------------------------------------------------------------------

const UpdateTagInput = builder.inputType("UpdateTagInput", {
  fields: (t) => ({
    name: t.string({ required: false }),
    color: t.string({ required: true }),
  }),
});

// ---------------------------------------------------------------------------
// Mutation
// ---------------------------------------------------------------------------

builder.mutationField("updateTag", (t) =>
  t.prismaField({
    type: TagRef,
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      tagId: t.arg.int({ required: true }),
      input: t.arg({ type: UpdateTagInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const tag = await ctx.prisma.tag.findFirstOrThrow({
        where: {
          organizationId: (ctx.me as AuthRoleContext).organizationId,
          id: args.tagId,
        },
      });

      // Prevent name collisions when the tag is being renamed
      if (args.input.name && args.input.name !== tag.name) {
        const existing = await findTagByName(
          args.input.name,
          (ctx.me as AuthRoleContext).organizationId,
        );

        if (existing && existing.id !== tag.id) {
          throw new GraphQLError("A tag with the same name already exists");
        }
      }

      return ctx.prisma.tag.update({
        ...query,
        where: { id: tag.id },
        data: {
          name: args.input.name ?? undefined,
          color: args.input.color,
        },
      });
    },
  }),
);

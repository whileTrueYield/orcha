/**
 * Mutation resolver for updating an existing PersonalTag.
 *
 * Registers: Mutation.updatePersonalTag(tagId: Int!, input: UpdatePersonalTagInput!): PersonalTag!
 *
 * Requires ADMIN or OWNER role. When the name changes, validates
 * no other personal tag for this owner already uses that name.
 */

import { GraphQLError } from "graphql";
import builder from "../../../schema/builder";
import { PersonalTagRef } from "../entity";
import { findPersonalTagByName } from "../helper";
import { AuthRoleContext } from "../../../types";

// ---------------------------------------------------------------------------
// Input type
// ---------------------------------------------------------------------------

const UpdatePersonalTagInput = builder.inputType("UpdatePersonalTagInput", {
  fields: (t) => ({
    name: t.string({ required: false }),
  }),
});

// ---------------------------------------------------------------------------
// Mutation
// ---------------------------------------------------------------------------

builder.mutationField("updatePersonalTag", (t) =>
  t.prismaField({
    type: PersonalTagRef,
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      tagId: t.arg.int({ required: true }),
      input: t.arg({ type: UpdatePersonalTagInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const personalTag = await ctx.prisma.personalTag.findFirstOrThrow({
        where: {
          organizationId: (ctx.me as AuthRoleContext).organizationId,
          ownerId: (ctx.me as AuthRoleContext).roleId,
          id: args.tagId,
        },
      });

      // Prevent name collisions when renaming
      if (args.input.name && args.input.name !== personalTag.name) {
        const existing = await findPersonalTagByName(
          args.input.name,
          (ctx.me as AuthRoleContext).organizationId,
          (ctx.me as AuthRoleContext).roleId,
        );

        if (existing && existing.id !== personalTag.id) {
          throw new GraphQLError("A tag with the same name already exists");
        }
      }

      return ctx.prisma.personalTag.update({
        ...query,
        where: { id: personalTag.id },
        data: { name: args.input.name ?? undefined },
      });
    },
  }),
);

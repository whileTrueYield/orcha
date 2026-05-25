/**
 * Mutation resolver for creating a new PersonalTag.
 *
 * Registers: Mutation.createPersonalTag(input: CreatePersonalTagInput!): PersonalTag!
 *
 * Requires ADMIN or OWNER role. Validates that no personal tag
 * with the same name (case-insensitive) already exists for this owner.
 */

import { GraphQLError } from "graphql";
import builder from "../../../schema/builder";
import { PersonalTagRef } from "../entity";
import { findPersonalTagByName } from "../helper";
import { AuthRoleContext } from "../../../types";

// ---------------------------------------------------------------------------
// Input type
// ---------------------------------------------------------------------------

const CreatePersonalTagInput = builder.inputType("CreatePersonalTagInput", {
  fields: (t) => ({
    name: t.string({ required: true }),
  }),
});

// ---------------------------------------------------------------------------
// Mutation
// ---------------------------------------------------------------------------

builder.mutationField("createPersonalTag", (t) =>
  t.prismaField({
    type: PersonalTagRef,
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      input: t.arg({ type: CreatePersonalTagInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const existing = await findPersonalTagByName(
        args.input.name,
        (ctx.me as AuthRoleContext).organizationId,
        (ctx.me as AuthRoleContext).roleId,
      );

      if (existing) {
        throw new GraphQLError("A tag with the same name already exists");
      }

      return ctx.prisma.personalTag.create({
        ...query,
        data: {
          name: args.input.name,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
          ownerId: (ctx.me as AuthRoleContext).roleId,
        },
      });
    },
  }),
);

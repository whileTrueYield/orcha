/**
 * Mutation resolver for creating a new Team.
 *
 * Registers: Mutation.createTeam(input: CreateTeamInput!): Team!
 *
 * Requires ADMIN or OWNER role. Validates that no team with the
 * same code (case-insensitive) already exists in the organisation.
 */

import { GraphQLError } from "graphql";
import builder from "../../../schema/builder";
import { TeamRef } from "../entity";
import { findTeamByCode } from "../helper";
import { AuthRoleContext } from "../../../types";

// ---------------------------------------------------------------------------
// Input type
// ---------------------------------------------------------------------------

const CreateTeamInput = builder.inputType("CreateTeamInput", {
  fields: (t) => ({
    name: t.string({ required: true }),
    code: t.string({ required: true }),
    description: t.string({ required: false }),
  }),
});

// ---------------------------------------------------------------------------
// Mutation
// ---------------------------------------------------------------------------

builder.mutationField("createTeam", (t) =>
  t.prismaField({
    type: TeamRef,
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      input: t.arg({ type: CreateTeamInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const existing = await findTeamByCode(
        args.input.code,
        (ctx.me as AuthRoleContext).organizationId,
      );

      if (existing) {
        throw new GraphQLError("A team with the same code already exists");
      }

      return ctx.prisma.team.create({
        ...query,
        data: {
          name: args.input.name,
          code: args.input.code,
          description: args.input.description ?? undefined,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
        },
      });
    },
  }),
);

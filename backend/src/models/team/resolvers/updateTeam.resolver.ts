/**
 * Mutation resolver for updating an existing Team.
 *
 * Registers: Mutation.updateTeam(teamId: Int!, input: UpdateTeamInput!): Team!
 *
 * Requires ADMIN or OWNER role. When the code changes, validates
 * no other team in the organisation already uses it.
 */

import { GraphQLError } from "graphql";
import builder from "../../../schema/builder";
import { TeamRef } from "../entity";
import { findTeamByCode } from "../helper";
import { AuthRoleContext } from "../../../types";

// ---------------------------------------------------------------------------
// Input type
// ---------------------------------------------------------------------------

const UpdateTeamInput = builder.inputType("UpdateTeamInput", {
  fields: (t) => ({
    name: t.string({ required: false }),
    code: t.string({ required: false }),
    description: t.string({ required: false }),
    coverUrl: t.string({ required: false }),
  }),
});

// ---------------------------------------------------------------------------
// Mutation
// ---------------------------------------------------------------------------

builder.mutationField("updateTeam", (t) =>
  t.prismaField({
    type: TeamRef,
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      teamId: t.arg.int({ required: true }),
      input: t.arg({ type: UpdateTeamInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const team = await ctx.prisma.team.findFirstOrThrow({
        where: {
          organizationId: (ctx.me as AuthRoleContext).organizationId,
          id: args.teamId,
        },
      });

      // Prevent code collisions when the team is being renamed
      if (args.input.code && args.input.code !== team.code) {
        const existing = await findTeamByCode(
          args.input.code,
          (ctx.me as AuthRoleContext).organizationId,
        );

        if (existing && existing.id !== team.id) {
          throw new GraphQLError("A team with the same code already exists");
        }
      }

      // Nullable columns (description, coverUrl) pass the value through so an
      // explicit `null` clears them; `undefined` still means "skip". Non-null
      // columns coerce `null` back to "skip" via `?? undefined`.
      return ctx.prisma.team.update({
        ...query,
        where: { id: team.id },
        data: {
          name: args.input.name ?? undefined,
          code: args.input.code ?? undefined,
          description: args.input.description,
          coverUrl: args.input.coverUrl,
        },
      });
    },
  }),
);

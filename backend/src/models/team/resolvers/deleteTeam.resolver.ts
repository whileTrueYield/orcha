/**
 * Mutation resolver for deleting a Team.
 *
 * Registers: Mutation.deleteTeam(teamId: Int!): Boolean!
 *
 * Requires ADMIN or OWNER role. Verifies the team belongs to the
 * caller's organisation before deletion.
 */

import builder from "../../../schema/builder";
import { AuthRoleContext } from "../../../types";

builder.mutationField("deleteTeam", (t) =>
  t.boolean({
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      teamId: t.arg.int({ required: true }),
    },
    resolve: async (_root, args, ctx) => {
      const team = await ctx.prisma.team.findFirstOrThrow({
        where: {
          id: args.teamId,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
        },
      });

      await ctx.prisma.team.delete({ where: { id: team.id } });
      return true;
    },
  }),
);

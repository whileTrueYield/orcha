/**
 * Query resolver for fetching a Team by its short code.
 *
 * Registers: Query.teamByCode(code: String!): Team!
 *
 * Requires any linked role. Scoped to the caller's organisation.
 */

import { GraphQLError } from "graphql";
import builder from "../../../schema/builder";
import { TeamRef } from "../entity";
import { findTeamByCode } from "../helper";
import { AuthRoleContext } from "../../../types";

builder.queryField("teamByCode", (t) =>
  t.prismaField({
    type: TeamRef,
    authScopes: { hasRole: true },
    args: {
      code: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const team = await findTeamByCode(args.code, (ctx.me as AuthRoleContext).organizationId);

      if (!team) {
        throw new GraphQLError(
          "This team does not exist or has been deleted",
        );
      }

      // Re-fetch with the query object so Pothos can optimize includes
      return ctx.prisma.team.findUniqueOrThrow({
        ...query,
        where: { id: team.id },
      });
    },
  }),
);

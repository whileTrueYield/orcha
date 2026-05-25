/**
 * Query and mutation resolvers for a single Team.
 *
 * Registers:
 *  - Query.team(id: Int!): Team!
 *  - Mutation.addMembers(teamId, roleIds): Team!
 *  - Mutation.removeMembers(teamId, roleIds): Team!
 *
 * addMembers/removeMembers require ADMIN or OWNER role.
 * The team query requires any linked role.
 */

import { RoleStatus } from "@prisma/client";
import builder from "../../../schema/builder";
import { TeamRef } from "../entity";
import { AuthRoleContext } from "../../../types";

// ---------------------------------------------------------------------------
// Query
// ---------------------------------------------------------------------------

builder.queryField("team", (t) =>
  t.prismaField({
    type: TeamRef,
    authScopes: { hasRole: true },
    args: {
      id: t.arg.int({ required: true }),
    },
    resolve: (query, _root, args, ctx) =>
      ctx.prisma.team.findFirstOrThrow({
        ...query,
        where: {
          id: args.id,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
        },
      }),
  }),
);

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

builder.mutationField("addMembers", (t) =>
  t.prismaField({
    type: TeamRef,
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      teamId: t.arg.int({ required: true }),
      roleIds: t.arg.intList({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const team = await ctx.prisma.team.findFirstOrThrow({
        where: {
          id: args.teamId,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
        },
      });

      // Only connect roles that actually belong to the org and are active
      const validRoleIds = await ctx.prisma.role.findMany({
        select: { id: true },
        where: {
          organizationId: (ctx.me as AuthRoleContext).organizationId,
          status: { in: [RoleStatus.ACCEPTED, RoleStatus.INVITED] },
          id: { in: args.roleIds },
        },
      });

      return ctx.prisma.team.update({
        ...query,
        where: { id: team.id },
        data: { members: { connect: validRoleIds } },
      });
    },
  }),
);

builder.mutationField("removeMembers", (t) =>
  t.prismaField({
    type: TeamRef,
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      teamId: t.arg.int({ required: true }),
      roleIds: t.arg.intList({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const team = await ctx.prisma.team.findFirstOrThrow({
        where: {
          id: args.teamId,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
        },
      });

      return ctx.prisma.team.update({
        ...query,
        where: { id: team.id },
        data: {
          members: {
            disconnect: args.roleIds.map((id) => ({ id })),
          },
        },
      });
    },
  }),
);

/**
 * Mutation: rejectRole — reject an invitation.
 */

import builder from "../../../schema/builder";
import { RoleStatus } from "@prisma/client";
import { AuthUserContext } from "../../../types";

builder.mutationField("rejectRole", (t) =>
  t.prismaField({
    type: "Role",
    authScopes: { isAuthenticated: true },
    args: {
      roleId: t.arg.int({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const role = await ctx.prisma.role.findFirstOrThrow({
        where: {
          id: args.roleId,
          userId: (ctx.me as AuthUserContext).userId,
          status: RoleStatus.INVITED,
        },
      });

      return ctx.prisma.role.update({
        ...query,
        where: { id: role.id },
        data: { status: RoleStatus.REJECTED },
      });
    },
  }),
);

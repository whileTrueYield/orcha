/**
 * Mutation: acceptRole — accept an invitation.
 */

import builder from "../../../schema/builder";
import { RoleStatus } from "@prisma/client";
import { AuthUserContext } from "../../../types";

const AcceptRoleInput = builder.inputType("AcceptRoleInput", {
  fields: (t) => ({
    roleId: t.int({ required: true }),
    timeZone: t.string({ required: true }),
  }),
});

builder.mutationField("acceptRole", (t) =>
  t.prismaField({
    type: "Role",
    authScopes: { isAuthenticated: true },
    args: {
      input: t.arg({ type: AcceptRoleInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const role = await ctx.prisma.role.findFirstOrThrow({
        where: {
          id: args.input.roleId,
          userId: (ctx.me as AuthUserContext).userId,
          status: RoleStatus.INVITED,
        },
      });

      return ctx.prisma.role.update({
        ...query,
        where: { id: role.id },
        data: { status: RoleStatus.ACCEPTED, timeZone: args.input.timeZone },
      });
    },
  }),
);

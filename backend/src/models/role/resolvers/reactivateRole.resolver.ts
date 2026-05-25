/**
 * Mutation: reactivateRole — reactivate a deactivated role.
 */

import builder from "../../../schema/builder";
import { RoleStatus, RoleType } from "@prisma/client";
import { getScheduleStatus, requestEstimate } from "../../ticket/jobs/estimateTickets";
import { GraphQLError } from "graphql";
import { AuthRoleContext } from "../../../types";

builder.mutationField("reactivateRole", (t) =>
  t.prismaField({
    type: "Role",
    authScopes: { hasRole: ["OWNER", "ADMIN"] },
    args: {
      roleId: t.arg.int({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const role = await ctx.prisma.role.findFirstOrThrow({
        where: {
          id: args.roleId,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
          status: RoleStatus.DEACTIVATED,
        },
      });

      if (role.type === RoleType.OWNER && (ctx.me as AuthRoleContext).roleType !== RoleType.OWNER) {
        throw new GraphQLError("Only an owner can reactivate another owner", { extensions: { code: "BAD_USER_INPUT" } });
      }

      if (role.id === (ctx.me as AuthRoleContext).roleId) {
        throw new GraphQLError("You cannot reactivate yourself", { extensions: { code: "BAD_USER_INPUT" } });
      }

      const updatedRole = await ctx.prisma.role.update({
        ...query,
        where: { id: role.id },
        data: { status: RoleStatus.ACCEPTED },
      });

      await ctx.prisma.organization.update({
        where: { id: (ctx.me as AuthRoleContext).organizationId },
        data: { scheduleStatus: await getScheduleStatus((ctx.me as AuthRoleContext).organizationId) },
      });

      await requestEstimate((ctx.me as AuthRoleContext).organizationId);

      return updatedRole;
    },
  }),
);

/**
 * Mutation: deleteScheduleItem — remove a schedule item (admin/owner only).
 *
 * Registers: Mutation.deleteScheduleItem(scheduleItemId): Boolean
 *
 * Auth: hasRole with ADMIN or OWNER.
 */

import builder from "../../../schema/builder";
import { AuthRoleContext } from "../../../types";

builder.mutationField("deleteScheduleItem", (t) =>
  t.boolean({
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      scheduleItemId: t.arg.int({ required: true }),
    },
    resolve: async (_root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      const scheduleItem = await ctx.prisma.scheduleItem.findFirstOrThrow({
        where: {
          id: args.scheduleItemId,
          organizationId: me.organizationId,
          roleId: me.roleId,
        },
      });

      if (scheduleItem) {
        await ctx.prisma.scheduleItem.delete({ where: { id: scheduleItem.id } });
        return true;
      }

      return false;
    },
  }),
);

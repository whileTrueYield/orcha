/**
 * Mutation resolver for deleting a PersonalTag.
 *
 * Registers: Mutation.deletePersonalTag(personalTagId: Int!): Boolean!
 *
 * Requires ADMIN or OWNER role. Verifies ownership before deletion.
 */

import builder from "../../../schema/builder";
import { AuthRoleContext } from "../../../types";

builder.mutationField("deletePersonalTag", (t) =>
  t.boolean({
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      personalTagId: t.arg.int({ required: true }),
    },
    resolve: async (_root, args, ctx) => {
      const personalTag = await ctx.prisma.personalTag.findFirstOrThrow({
        where: {
          id: args.personalTagId,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
          ownerId: (ctx.me as AuthRoleContext).roleId,
        },
      });

      await ctx.prisma.personalTag.delete({ where: { id: personalTag.id } });
      return true;
    },
  }),
);

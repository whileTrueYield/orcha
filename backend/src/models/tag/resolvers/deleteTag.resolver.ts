/**
 * Mutation resolver for deleting an organisation-level Tag.
 *
 * Registers: Mutation.deleteTag(tagId: Int!): Boolean!
 *
 * Requires ADMIN or OWNER role. Verifies the tag belongs to the
 * caller's organisation before deletion.
 */

import builder from "../../../schema/builder";
import { AuthRoleContext } from "../../../types";

builder.mutationField("deleteTag", (t) =>
  t.boolean({
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      tagId: t.arg.int({ required: true }),
    },
    resolve: async (_root, args, ctx) => {
      const tag = await ctx.prisma.tag.findFirstOrThrow({
        where: {
          id: args.tagId,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
        },
      });

      await ctx.prisma.tag.delete({ where: { id: tag.id } });
      return true;
    },
  }),
);

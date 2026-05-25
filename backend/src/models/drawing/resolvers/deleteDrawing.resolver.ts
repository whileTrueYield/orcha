/**
 * DeleteDrawing mutation — deletes a drawing from the caller's org.
 *
 * Exports: none (side-effect: registers `deleteDrawing` mutation on the builder).
 *
 * The original used `hasRole([])` which maps to hasRole with an empty array —
 * effectively "any linked role" (same as `hasRole: true`).
 */

import builder from "../../../schema/builder";
import { AuthRoleContext } from "../../../types";

builder.mutationField("deleteDrawing", (t) =>
  t.prismaField({
    type: "Drawing",
    authScopes: { hasRole: true },
    args: {
      drawingId: t.arg.int({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      // hasRole scope guarantees AuthRoleContext at runtime.
      const me = ctx.me as AuthRoleContext;

      // Verify ownership before deletion.
      const drawing = await ctx.prisma.drawing.findFirstOrThrow({
        where: {
          id: args.drawingId,
          organizationId: me.organizationId,
        },
      });

      return ctx.prisma.drawing.delete({
        ...query,
        where: { id: drawing.id },
      });
    },
  }),
);

/**
 * Drawing query — fetch a single drawing by ID within the caller's org.
 *
 * Exports: none (side-effect: registers `drawing` query on the builder).
 *
 * Also registers the Drawing Prisma object type so it's available to all
 * drawing resolvers. The organization relation is resolved eagerly to match
 * the original FieldResolver behavior.
 */

import { GraphQLError } from "graphql";
import builder from "../../../schema/builder";
import { AuthRoleContext } from "../../../types";

// ---------------------------------------------------------------------------
// Drawing Prisma object
// ---------------------------------------------------------------------------

export const DrawingRef = builder.prismaObject("Drawing", {
  fields: (t) => ({
    id: t.exposeInt("id"),
    data: t.exposeString("data"),
    organizationId: t.exposeInt("organizationId"),
    roleId: t.exposeInt("roleId", { nullable: true }),
    lockExpiration: t.expose("lockExpiration", {
      type: "DateTime",
      nullable: true,
    }),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
    organization: t.relation("organization"),
    role: t.relation("role", { nullable: true }),
  }),
});

// ---------------------------------------------------------------------------
// Query
// ---------------------------------------------------------------------------

builder.queryField("drawing", (t) =>
  t.prismaField({
    type: "Drawing",
    authScopes: { hasRole: true },
    args: {
      id: t.arg.int({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      // hasRole scope guarantees AuthRoleContext at runtime.
      const me = ctx.me as AuthRoleContext;
      const drawing = await ctx.prisma.drawing.findFirst({
        ...query,
        where: {
          id: args.id,
          organizationId: me.organizationId,
        },
      });

      if (!drawing) {
        throw new GraphQLError(
          "This drawing does not exist or has been deleted",
          { extensions: { code: "BAD_USER_INPUT" } },
        );
      }

      return drawing;
    },
  }),
);

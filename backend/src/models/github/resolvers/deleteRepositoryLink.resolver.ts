/**
 * Mutation resolver for deleting a GitHub Repository link.
 *
 * Registers:
 *  - Mutation.deleteRepositoryLink(id): RepositoryLink!
 *
 * ADMIN/OWNER only. The link is looked up within the caller's Organization, so
 * links in other tenants are invisible (reported as not-found, not forbidden).
 * Deleting an active link frees its repo for re-binding.
 */

import { GraphQLError } from "graphql";
import builder from "../../../schema/builder";
import { AuthRoleContext } from "../../../types";

builder.mutationField("deleteRepositoryLink", (t) =>
  t.prismaField({
    type: "RepositoryLink",
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      id: t.arg.int({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      const link = await ctx.prisma.repositoryLink.findFirst({
        where: { id: args.id, organizationId: me.organizationId },
      });

      if (!link) {
        throw new GraphQLError("Repository link not found");
      }

      return ctx.prisma.repositoryLink.delete({
        ...query,
        where: { id: link.id },
      });
    },
  }),
);

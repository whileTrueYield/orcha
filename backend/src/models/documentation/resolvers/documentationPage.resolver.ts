/**
 * Query resolver for a single DocumentationPage.
 *
 * Registers:
 *  - Query.documentationPage(id: Int!): DocumentationPage!
 *
 * Requires a linked role.
 */

import { GraphQLError } from "graphql";
import builder from "../../../schema/builder";
import { DocumentationPageRef } from "../entity";
import { AuthRoleContext } from "../../../types";

// ---------------------------------------------------------------------------
// Query — single documentation page
// ---------------------------------------------------------------------------

builder.queryField("documentationPage", (t) =>
  t.prismaField({
    type: DocumentationPageRef,
    authScopes: { hasRole: true },
    args: {
      id: t.arg.int({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const page = await ctx.prisma.documentationPage.findFirst({
        ...query,
        where: {
          id: args.id,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
        },
      });

      if (!page) {
        throw new GraphQLError(
          "This documentationPage does not exist or has been deleted",
        );
      }

      return page;
    },
  }),
);


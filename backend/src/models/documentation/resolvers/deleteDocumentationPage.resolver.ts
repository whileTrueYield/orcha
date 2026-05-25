/**
 * Mutation resolver for hard-deleting a DocumentationPage.
 *
 * Registers: Mutation.deleteDocumentationPage(documentationPageId: Int!): DocumentationPage!
 *
 * Requires ADMIN or OWNER role. Returns the deleted page.
 */

import builder from "../../../schema/builder";
import { DocumentationPageRef } from "../entity";
import { AuthRoleContext } from "../../../types";

builder.mutationField("deleteDocumentationPage", (t) =>
  t.prismaField({
    type: DocumentationPageRef,
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      documentationPageId: t.arg.int({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const page = await ctx.prisma.documentationPage.findFirstOrThrow({
        where: {
          id: args.documentationPageId,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
        },
      });

      return ctx.prisma.documentationPage.delete({
        ...query,
        where: { id: page.id },
      });
    },
  }),
);

/**
 * Mutation resolver for soft-deleting a Documentation.
 *
 * Registers: Mutation.deleteDocumentation(documentationId: Int!): Documentation!
 *
 * Requires ADMIN or OWNER role. Soft-deletes by setting stage to DELETED.
 */

import { ModelStage } from "@prisma/client";
import builder from "../../../schema/builder";
import { DocumentationRef } from "../entity";
import { AuthRoleContext } from "../../../types";

builder.mutationField("deleteDocumentation", (t) =>
  t.prismaField({
    type: DocumentationRef,
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      documentationId: t.arg.int({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const documentation =
        await ctx.prisma.documentation.findFirstOrThrow({
          where: {
            id: args.documentationId,
            organizationId: (ctx.me as AuthRoleContext).organizationId,
          },
        });

      return ctx.prisma.documentation.update({
        ...query,
        where: { id: documentation.id },
        data: { stage: ModelStage.DELETED },
      });
    },
  }),
);

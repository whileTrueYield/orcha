/**
 * Query resolver for a single DocumentationPage, plus a query for
 * generating a short-lived access token for the collaborative editor.
 *
 * Registers:
 *  - Query.documentationPage(id: Int!): DocumentationPage!
 *  - Query.documentationPageAccessToken(id: Int!): String
 *
 * Both require a linked role.
 */

import { GraphQLError } from "graphql";
import { ModelStage } from "@prisma/client";
import jwt from "jsonwebtoken";
import builder from "../../../schema/builder";
import { DocumentationPageRef } from "../entity";
import { logger } from "../../../logger";
import { config } from "../../../config";
import { DocumentToken } from "../../../hocuspocus/documentToken";
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

// ---------------------------------------------------------------------------
// Query — access token for the collaborative Yjs editor
//
// The token is valid for 15 minutes and scoped to a single page.
// ---------------------------------------------------------------------------

builder.queryField("documentationPageAccessToken", (t) =>
  t.string({
    nullable: true,
    authScopes: { hasRole: true },
    args: {
      id: t.arg.int({ required: true }),
    },
    resolve: async (_root, args, ctx) => {
      const page = await ctx.prisma.documentationPage.findFirstOrThrow({
        where: {
          id: args.id,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
          documentation: { stage: { not: ModelStage.DELETED } },
        },
        include: { documentation: true },
      });

      const isReadOnly = page.documentation.stage === "ARCHIVED";

      const accessToken: DocumentToken = {
        roleId: (ctx.me as AuthRoleContext).roleId,
        orgId: (ctx.me as AuthRoleContext).organizationId,
        documentId: page.id,
        documentType: "documentationText",
        mode: isReadOnly ? "read" : "write",
      };

      logger.info(
        `creating access token for documentation page ${page.title},\n${JSON.stringify(accessToken, null, 2)}`,
      );

      return jwt.sign(accessToken, config.sessionSecret, {
        expiresIn: 900, // 15 minutes
      });
    },
  }),
);

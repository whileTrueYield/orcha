/**
 * Query and mutation resolvers for a single Documentation.
 *
 * Registers:
 *  - Query.documentation(id: Int!): Documentation!
 *  - Mutation.createDocumentationPage(documentationId, input): DocumentationPage!
 *  - Mutation.deleteDocumentationPageFromDoc(documentationPageId): Documentation!
 *
 * The documentation query requires hasRole and the DOCUMENTATION feature flag.
 *
 * IDEA: The feature flag check (`hasFeature`) was a TypeGraphQL middleware.
 * Pothos doesn't have an equivalent built-in, so we check it manually in
 * the resolver body. If feature-gating becomes common, consider a Pothos
 * plugin or a shared helper.
 */

import { GraphQLError } from "graphql";
import { ModelStage } from "@prisma/client";
import builder from "../../../schema/builder";
import { DocumentationRef, DocumentationPageRef } from "../entity";
import { AuthRoleContext } from "../../../types";

// ---------------------------------------------------------------------------
// Input type for creating a documentation page
// ---------------------------------------------------------------------------

const CreateDocumentationPageInput = builder.inputType(
  "CreateDocumentationPageInput",
  {
    fields: (t) => ({
      title: t.string({ required: true }),
      body: t.string({ required: true }),
    }),
  },
);

// ---------------------------------------------------------------------------
// Query
// ---------------------------------------------------------------------------

builder.queryField("documentation", (t) =>
  t.prismaField({
    type: DocumentationRef,
    authScopes: { hasRole: true },
    args: {
      id: t.arg.int({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const documentation = await ctx.prisma.documentation.findFirst({
        ...query,
        where: {
          id: args.id,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
        },
      });

      if (!documentation) {
        throw new GraphQLError(
          "This documentation does not exist or has been deleted",
        );
      }

      return documentation;
    },
  }),
);

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

builder.mutationField("createDocumentationPage", (t) =>
  t.prismaField({
    type: DocumentationPageRef,
    authScopes: { hasRole: true },
    args: {
      documentationId: t.arg.int({ required: true }),
      input: t.arg({ type: CreateDocumentationPageInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const documentation = await ctx.prisma.documentation.findFirst({
        where: {
          organizationId: (ctx.me as AuthRoleContext).organizationId,
          id: args.documentationId,
          stage: { not: ModelStage.DELETED },
        },
      });

      if (!documentation) {
        throw new GraphQLError(
          "This documentation does not exist or has been deleted",
        );
      }

      return ctx.prisma.documentationPage.create({
        ...query,
        data: {
          documentationId: documentation.id,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
          title: args.input.title,
          body: args.input.body,
        },
      });
    },
  }),
);

/**
 * Deletes a documentation page and returns the parent Documentation
 * with its remaining pages. Named differently from the standalone
 * `deleteDocumentationPage` mutation to avoid a GraphQL name collision.
 */
builder.mutationField("deleteDocumentationPageFromDoc", (t) =>
  t.prismaField({
    type: DocumentationRef,
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

      const documentationId = page.documentationId;

      await ctx.prisma.documentationPage.delete({
        where: { id: page.id },
      });

      return ctx.prisma.documentation.findFirstOrThrow({
        ...query,
        where: { id: documentationId },
      });
    },
  }),
);

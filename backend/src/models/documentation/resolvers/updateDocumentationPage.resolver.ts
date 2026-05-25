/**
 * Mutation resolvers for updating DocumentationPage content and structure.
 *
 * Registers:
 *  - Mutation.updateDocumentationPageConfig(pageId, input): DocumentationPage!
 *  - Mutation.updateDocumentationPage(pageId, input): DocumentationPage!
 *  - Mutation.addChildToDocumentationPage(parentId, childId): DocumentationPage!
 *  - Mutation.moveBeforeDocumentationPage(beforeId, pageId): DocumentationPage!
 *  - Mutation.moveAfterDocumentationPage(afterId, pageId): DocumentationPage!
 *
 * All require ADMIN or OWNER role.
 */

import { GraphQLError } from "graphql";
import { ModelStage } from "@prisma/client";
import builder from "../../../schema/builder";
import { DocumentationPageRef } from "../entity";
import { logger } from "../../../logger";
import { AuthRoleContext } from "../../../types";

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

const UpdateDocumentationPageInput = builder.inputType(
  "UpdateDocumentationPageInput",
  {
    fields: (t) => ({
      body: t.string({ required: true }),
    }),
  },
);

const UpdateDocumentationPageConfigInput = builder.inputType(
  "UpdateDocumentationPageConfigInput",
  {
    fields: (t) => ({
      title: t.string({ required: true }),
      urls: t.stringList({ required: true }),
      keywords: t.stringList({ required: true }),
      customId: t.string({ required: false }),
    }),
  },
);

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

builder.mutationField("updateDocumentationPageConfig", (t) =>
  t.prismaField({
    type: DocumentationPageRef,
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      documentationPageId: t.arg.int({ required: true }),
      input: t.arg({
        type: UpdateDocumentationPageConfigInput,
        required: true,
      }),
    },
    resolve: async (query, _root, args, ctx) => {
      const page = await ctx.prisma.documentationPage.findFirstOrThrow({
        where: {
          id: args.documentationPageId,
          documentation: {
            stage: { not: ModelStage.DELETED },
            organization: { id: (ctx.me as AuthRoleContext).organizationId },
          },
        },
      });

      // Validate custom ID uniqueness within the documentation
      if (args.input.customId) {
        const duplicate = await ctx.prisma.documentationPage.findFirst({
          where: {
            id: { not: args.documentationPageId },
            documentationId: page.documentationId,
            customId: args.input.customId,
          },
        });

        if (duplicate) {
          throw new GraphQLError(
            `The custom ID ${args.input.customId} is already used in this documentation`,
          );
        }
      }

      return ctx.prisma.documentationPage.update({
        ...query,
        where: { id: page.id },
        data: {
          urls: JSON.stringify(args.input.urls),
          keywords: JSON.stringify(args.input.keywords),
          customId: args.input.customId || null,
          title: args.input.title,
        },
      });
    },
  }),
);

builder.mutationField("updateDocumentationPage", (t) =>
  t.prismaField({
    type: DocumentationPageRef,
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      documentationPageId: t.arg.int({ required: true }),
      input: t.arg({ type: UpdateDocumentationPageInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const page = await ctx.prisma.documentationPage.findFirstOrThrow({
        where: {
          id: args.documentationPageId,
          documentation: {
            stage: { not: ModelStage.DELETED },
            organization: { id: (ctx.me as AuthRoleContext).organizationId },
          },
        },
      });

      return ctx.prisma.documentationPage.update({
        ...query,
        where: { id: page.id },
        data: { body: args.input.body },
      });
    },
  }),
);

builder.mutationField("addChildToDocumentationPage", (t) =>
  t.prismaField({
    type: DocumentationPageRef,
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      parentDocumentationPageId: t.arg.int({ required: true }),
      childDocumentationPageId: t.arg.int({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      if (
        args.parentDocumentationPageId === args.childDocumentationPageId
      ) {
        throw new GraphQLError("Cannot move a page under itself");
      }

      const parentPage =
        await ctx.prisma.documentationPage.findFirstOrThrow({
          where: {
            id: args.parentDocumentationPageId,
            documentation: {
              stage: { not: ModelStage.DELETED },
              organization: { id: (ctx.me as AuthRoleContext).organizationId },
            },
          },
          include: { parent: true },
        });

      const childPage =
        await ctx.prisma.documentationPage.findFirstOrThrow({
          where: {
            id: args.childDocumentationPageId,
            documentationId: parentPage.documentationId,
          },
        });

      // Walk up the ancestor chain to prevent circular nesting
      let nextParent = parentPage.parent;
      while (nextParent !== null) {
        if (nextParent.id === childPage.id) {
          throw new GraphQLError(
            "Cannot move a page under one of its children or itself",
          );
        }

        nextParent = nextParent.parentId
          ? await ctx.prisma.documentationPage.findFirst({
              where: { id: nextParent.parentId },
            })
          : null;
      }

      // Place the child at the end of the parent's children
      const lastSibling = await ctx.prisma.documentationPage.findFirst({
        where: { parentId: parentPage.id },
        orderBy: { position: "desc" },
      });

      return ctx.prisma.documentationPage.update({
        ...query,
        where: { id: childPage.id },
        data: {
          parentId: parentPage.id,
          position: lastSibling ? lastSibling.position + 1 : 0,
        },
      });
    },
  }),
);

builder.mutationField("moveBeforeDocumentationPage", (t) =>
  t.prismaField({
    type: DocumentationPageRef,
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      beforeDocumentationPageId: t.arg.int({ required: true }),
      documentationPageId: t.arg.int({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      if (
        args.beforeDocumentationPageId === args.documentationPageId
      ) {
        throw new GraphQLError("Cannot move a page before itself");
      }

      const beforePage =
        await ctx.prisma.documentationPage.findFirstOrThrow({
          where: {
            id: args.beforeDocumentationPageId,
            documentation: {
              stage: { not: ModelStage.DELETED },
              organization: { id: (ctx.me as AuthRoleContext).organizationId },
            },
          },
          include: { parent: true },
        });

      let movedPage =
        await ctx.prisma.documentationPage.findFirstOrThrow({
          where: {
            id: args.documentationPageId,
            documentationId: beforePage.documentationId,
          },
        });

      // Prevent circular nesting
      let nextParent = beforePage.parent;
      while (nextParent !== null) {
        if (nextParent.id === movedPage.id) {
          throw new GraphQLError(
            "Cannot move a page under one of its children or itself",
          );
        }

        nextParent = nextParent.parentId
          ? await ctx.prisma.documentationPage.findFirst({
              where: { id: nextParent.parentId },
            })
          : null;
      }

      // Grab all sibling pages (excluding the one being moved)
      const allPages = await ctx.prisma.documentationPage.findMany({
        where: {
          documentationId: beforePage.documentationId,
          parentId: beforePage.parentId,
          id: { not: args.documentationPageId },
        },
        orderBy: { position: "asc" },
      });

      // Insert the moved page before the target, then reindex
      let offset = 0;
      let position = 0;
      for (const page of allPages) {
        if (page.id === args.beforeDocumentationPageId) {
          movedPage = await ctx.prisma.documentationPage.update({
            where: { id: movedPage.id },
            data: { position, parentId: beforePage.parentId },
          });
          logger.info(`page: ${page.id}: ${position}`);
          offset = 1;
        }

        if (page.position !== position + offset) {
          await ctx.prisma.documentationPage.update({
            where: { id: page.id },
            data: { position: position + offset },
          });
          logger.info(`page: ${page.id}: ${position + offset}`);
        }

        position += 1;
      }

      // Re-fetch with Pothos query for includes
      return ctx.prisma.documentationPage.findUniqueOrThrow({
        ...query,
        where: { id: movedPage.id },
      });
    },
  }),
);

builder.mutationField("moveAfterDocumentationPage", (t) =>
  t.prismaField({
    type: DocumentationPageRef,
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      afterDocumentationPageId: t.arg.int({ required: true }),
      documentationPageId: t.arg.int({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      if (
        args.afterDocumentationPageId === args.documentationPageId
      ) {
        throw new GraphQLError("Cannot move a page after itself");
      }

      const afterPage =
        await ctx.prisma.documentationPage.findFirstOrThrow({
          where: {
            id: args.afterDocumentationPageId,
            documentation: {
              stage: { not: ModelStage.DELETED },
              organization: { id: (ctx.me as AuthRoleContext).organizationId },
            },
          },
          include: { parent: true },
        });

      let movedPage =
        await ctx.prisma.documentationPage.findFirstOrThrow({
          where: {
            id: args.documentationPageId,
            documentationId: afterPage.documentationId,
          },
        });

      // Prevent circular nesting
      let nextParent = afterPage.parent;
      while (nextParent !== null) {
        if (nextParent.id === movedPage.id) {
          throw new GraphQLError(
            "Cannot move a page under one of its children or itself",
          );
        }

        nextParent = nextParent.parentId
          ? await ctx.prisma.documentationPage.findFirst({
              where: { id: nextParent.parentId },
            })
          : null;
      }

      // Grab all sibling pages (excluding the one being moved)
      const allPages = await ctx.prisma.documentationPage.findMany({
        where: {
          documentationId: afterPage.documentationId,
          parentId: afterPage.parentId,
          id: { not: args.documentationPageId },
        },
        orderBy: { position: "asc" },
      });

      // Insert the moved page after the target, then reindex
      let offset = 0;
      let position = 0;
      for (const page of allPages) {
        if (page.position !== position + offset) {
          await ctx.prisma.documentationPage.update({
            where: { id: page.id },
            data: { position: position + offset },
          });
        }

        if (page.id === args.afterDocumentationPageId) {
          offset = 1;
          movedPage = await ctx.prisma.documentationPage.update({
            where: { id: movedPage.id },
            data: {
              position: position + offset,
              parentId: afterPage.parentId,
            },
          });
        }

        position += 1;
      }

      // Re-fetch with Pothos query for includes
      return ctx.prisma.documentationPage.findUniqueOrThrow({
        ...query,
        where: { id: movedPage.id },
      });
    },
  }),
);

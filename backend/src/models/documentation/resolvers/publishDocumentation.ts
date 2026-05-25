/**
 * Mutation resolvers for publishing/unpublishing a Documentation.
 *
 * Registers:
 *  - Mutation.publishDocumentation(id: Int!): Documentation!
 *  - Mutation.unpublishDocumentation(id: Int!): Documentation!
 *
 * Both require a linked role. They enqueue background jobs to
 * generate/remove the published documentation artifacts.
 */

import { GraphQLError } from "graphql";
import { ModelStage } from "@prisma/client";
import { subMinutes } from "date-fns";
import builder from "../../../schema/builder";
import { DocumentationRef } from "../entity";
import { cronQueue } from "../../../cron/queues";
import { config } from "../../../config";
import { publishDocumentationTask } from "../jobs/publishDocumentationTask";
import { AuthRoleContext } from "../../../types";

// ---------------------------------------------------------------------------
// Unpublish
// ---------------------------------------------------------------------------

builder.mutationField("unpublishDocumentation", (t) =>
  t.prismaField({
    type: DocumentationRef,
    authScopes: { hasRole: true },
    args: {
      id: t.arg.int({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const documentation = await ctx.prisma.documentation.findFirst({
        where: {
          id: args.id,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
        },
      });

      if (!documentation) {
        throw new GraphQLError("This documentation does not exist");
      }

      if (
        documentation.lastPublishRequestAt &&
        documentation.lastPublishRequestAt > subMinutes(new Date(), 10)
      ) {
        throw new GraphQLError("This documentation is still publishing");
      }

      await cronQueue.add("unpublishDocumentation", {
        documentationId: documentation.id,
      });

      return ctx.prisma.documentation.update({
        ...query,
        where: { id: documentation.id },
        data: { lastPublishRequestAt: new Date() },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Publish
// ---------------------------------------------------------------------------

builder.mutationField("publishDocumentation", (t) =>
  t.prismaField({
    type: DocumentationRef,
    authScopes: { hasRole: true },
    args: {
      id: t.arg.int({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const documentation = await ctx.prisma.documentation.findFirst({
        where: {
          id: args.id,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
          stage: { in: [ModelStage.PUBLISHED, ModelStage.DRAFT] },
        },
      });

      if (!documentation) {
        throw new GraphQLError(
          "This documentation does not exist or has not been published",
        );
      }

      if (
        documentation.lastPublishRequestAt &&
        documentation.lastPublishRequestAt > subMinutes(new Date(), 5)
      ) {
        throw new GraphQLError("This documentation is still publishing");
      }

      // In dev, run the task synchronously for faster feedback
      if (config.isDev) {
        await publishDocumentationTask(documentation.id);
      }

      await cronQueue.add("publishDocumentation", {
        documentationId: documentation.id,
      });

      return ctx.prisma.documentation.update({
        ...query,
        where: { id: documentation.id },
        data: { lastPublishRequestAt: new Date() },
      });
    },
  }),
);

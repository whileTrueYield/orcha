/**
 * Mutation resolvers for updating a Documentation.
 *
 * Registers:
 *  - Mutation.updateDocumentationStage(documentationId, stage): Documentation!
 *  - Mutation.updateDocumentation(documentationId, input): Documentation!
 *
 * Both require ADMIN or OWNER role.
 */

import { GraphQLError } from "graphql";
import { ModelStage } from "@prisma/client";
import builder from "../../../schema/builder";
import { ModelStageEnum } from "../../../schema/enums";
import { DocumentationRef } from "../entity";
import { isAdminLevel } from "../../../utils/rbac";
import { AuthRoleContext } from "../../../types";

// ---------------------------------------------------------------------------
// Input type
// ---------------------------------------------------------------------------

const UpdateDocumentationInput = builder.inputType(
  "UpdateDocumentationInput",
  {
    fields: (t) => ({
      name: t.string({ required: false }),
      description: t.string({ required: false }),
      logoUrl: t.string({ required: false }),
    }),
  },
);

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

builder.mutationField("updateDocumentationStage", (t) =>
  t.prismaField({
    type: DocumentationRef,
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      documentationId: t.arg.int({ required: true }),
      stage: t.arg({ type: ModelStageEnum, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const documentation =
        await ctx.prisma.documentation.findFirstOrThrow({
          where: {
            id: args.documentationId,
            organizationId: (ctx.me as AuthRoleContext).organizationId,
          },
        });

      const stage = args.stage as ModelStage;

      // Only admins can hard-delete
      if (stage === ModelStage.DELETED && !isAdminLevel((ctx.me as AuthRoleContext).roleType)) {
        throw new GraphQLError("Only admins can delete a documentation");
      }

      // Documentation can transition freely between non-DELETED stages
      const allowedTransitions: Record<string, ModelStage[]> = {
        [ModelStage.DRAFT]: [
          ModelStage.DELETED,
          ModelStage.PUBLISHED,
          ModelStage.ARCHIVED,
        ],
        [ModelStage.ARCHIVED]: [
          ModelStage.DELETED,
          ModelStage.PUBLISHED,
          ModelStage.DRAFT,
        ],
        [ModelStage.PUBLISHED]: [
          ModelStage.DELETED,
          ModelStage.ARCHIVED,
          ModelStage.DRAFT,
        ],
      };

      if (
        stage in allowedTransitions &&
        allowedTransitions[stage].indexOf(documentation.stage) !== -1
      ) {
        return ctx.prisma.documentation.update({
          ...query,
          where: { id: documentation.id },
          data: { stage },
        });
      }

      throw new GraphQLError(
        `Cannot go from ${documentation.stage} to ${stage}`,
      );
    },
  }),
);

builder.mutationField("updateDocumentation", (t) =>
  t.prismaField({
    type: DocumentationRef,
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      documentationId: t.arg.int({ required: true }),
      input: t.arg({ type: UpdateDocumentationInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const documentation =
        await ctx.prisma.documentation.findFirstOrThrow({
          where: {
            organizationId: (ctx.me as AuthRoleContext).organizationId,
            id: args.documentationId,
          },
        });

      return ctx.prisma.documentation.update({
        ...query,
        where: { id: documentation.id },
        data: {
          name: args.input.name ?? undefined,
          description: args.input.description ?? undefined,
          logoUrl: args.input.logoUrl ?? undefined,
        },
      });
    },
  }),
);

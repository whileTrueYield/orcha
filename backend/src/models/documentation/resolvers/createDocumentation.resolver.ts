/**
 * Mutation resolver for creating a new Documentation.
 *
 * Registers: Mutation.createDocumentation(input: CreateDocumentationInput!): Documentation!
 *
 * Requires a linked role. Creates the documentation in DRAFT stage
 * and seeds it with a default first page.
 */

import { ModelStage } from "@prisma/client";
import builder from "../../../schema/builder";
import { DocumentationRef } from "../entity";
import { AuthRoleContext } from "../../../types";

// ---------------------------------------------------------------------------
// Input type
// ---------------------------------------------------------------------------

const CreateDocumentationInput = builder.inputType(
  "CreateDocumentationInput",
  {
    fields: (t) => ({
      name: t.string({ required: true }),
      description: t.string({ required: false }),
    }),
  },
);

// ---------------------------------------------------------------------------
// Mutation
// ---------------------------------------------------------------------------

builder.mutationField("createDocumentation", (t) =>
  t.prismaField({
    type: DocumentationRef,
    authScopes: { hasRole: true },
    args: {
      input: t.arg({ type: CreateDocumentationInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const documentation = await ctx.prisma.documentation.create({
        ...query,
        data: {
          name: args.input.name,
          description: args.input.description ?? undefined,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
          stage: ModelStage.DRAFT,
        },
      });

      // Seed with a default first page
      await ctx.prisma.documentationPage.create({
        data: {
          documentation: { connect: { id: documentation.id } },
          organization: { connect: { id: (ctx.me as AuthRoleContext).organizationId } },
          position: 1,
          title: "first page",
          body: "# My first page\n\n This is your first documentation page",
        },
      });

      return documentation;
    },
  }),
);

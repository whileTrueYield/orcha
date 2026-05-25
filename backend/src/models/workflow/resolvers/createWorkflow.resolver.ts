/**
 * Mutation: createWorkflow — create a new workflow.
 */

import builder from "../../../schema/builder";
import { findWorkflowByName } from "../helper";
import { GraphQLError } from "graphql";
import { ModelStage } from "@prisma/client";
import { AuthRoleContext } from "../../../types";

const CreateWorkflowInput = builder.inputType("CreateWorkflowInput", {
  fields: (t) => ({
    name: t.string({ required: true }),
    description: t.string({ required: false }),
  }),
});

builder.mutationField("createWorkflow", (t) =>
  t.prismaField({
    type: "Workflow",
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      input: t.arg({ type: CreateWorkflowInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const workflowUsingSameName = await findWorkflowByName(
        args.input.name,
        (ctx.me as AuthRoleContext).organizationId,
      );

      if (workflowUsingSameName) {
        throw new GraphQLError("A workflow with the same name already exists", { extensions: { code: "BAD_USER_INPUT" } });
      }

      return ctx.prisma.workflow.create({
        ...query,
        data: {
          name: args.input.name,
          description: args.input.description,
          stage: ModelStage.PUBLISHED,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
        },
      });
    },
  }),
);

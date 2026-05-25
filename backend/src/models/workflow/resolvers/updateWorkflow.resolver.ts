/**
 * Mutations: updateWorkflowStage, updateWorkflow.
 */

import builder from "../../../schema/builder";
import { ModelStageEnum } from "../../../schema/enums";
import { findWorkflowByName } from "../helper";
import { GraphQLError } from "graphql";
import { ModelStage as DbModelStage, Prisma } from "@prisma/client";
import { AuthRoleContext } from "../../../types";

const UpdateWorkflowInput = builder.inputType("UpdateWorkflowInput", {
  fields: (t) => ({
    name: t.string({ required: true }),
    description: t.string({ required: false }),
    color: t.string({ required: true }),
    isDefaultWorkflow: t.boolean({ required: false }),
  }),
});

// ---------------------------------------------------------------------------
// Mutation: updateWorkflowStage
// ---------------------------------------------------------------------------

builder.mutationField("updateWorkflowStage", (t) =>
  t.prismaField({
    type: "Workflow",
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      workflowId: t.arg.int({ required: true }),
      stage: t.arg({ type: ModelStageEnum, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const workflow = await ctx.prisma.workflow.findFirstOrThrow({
        where: {
          id: args.workflowId,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
        },
      });

      const allowedTransitions: { [key: string]: DbModelStage[] } = {
        [DbModelStage.DRAFT]: [DbModelStage.DELETED, DbModelStage.PUBLISHED],
        [DbModelStage.ARCHIVED]: [DbModelStage.DELETED, DbModelStage.PUBLISHED],
        [DbModelStage.PUBLISHED]: [DbModelStage.DELETED, DbModelStage.ARCHIVED],
      };

      if (
        args.stage in allowedTransitions &&
        allowedTransitions[args.stage].indexOf(workflow.stage)
      ) {
        return ctx.prisma.workflow.update({
          ...query,
          where: { id: workflow.id },
          data: { stage: args.stage },
        });
      }

      throw new GraphQLError(`Cannot go from ${workflow.stage} to ${args.stage}`, { extensions: { code: "BAD_USER_INPUT" } });
    },
  }),
);

// ---------------------------------------------------------------------------
// Mutation: updateWorkflow
// ---------------------------------------------------------------------------

builder.mutationField("updateWorkflow", (t) =>
  t.prismaField({
    type: "Workflow",
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      workflowId: t.arg.int({ required: true }),
      input: t.arg({ type: UpdateWorkflowInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const updateData: Prisma.WorkflowUpdateInput = {
        name: args.input.name,
        description: args.input.description,
        isDefaultWorkflow: args.input.isDefaultWorkflow ?? undefined,
      };

      const workflow = await ctx.prisma.workflow.findFirstOrThrow({
        where: {
          id: args.workflowId,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
        },
      });

      if (args.input.name && args.input.name !== workflow.name) {
        const existingWorkflow = await findWorkflowByName(
          args.input.name,
          (ctx.me as AuthRoleContext).organizationId,
        );

        if (existingWorkflow && existingWorkflow.id !== workflow.id) {
          throw new GraphQLError("A workflow with the same name already exists", { extensions: { code: "BAD_USER_INPUT" } });
        }
      }

      if (args.input.color) {
        updateData.color = args.input.color;
      }

      return ctx.prisma.workflow.update({
        ...query,
        where: { id: workflow.id },
        data: updateData,
      });
    },
  }),
);

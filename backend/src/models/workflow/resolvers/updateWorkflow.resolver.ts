import {
  Arg,
  Resolver,
  Mutation,
  InputType,
  Field,
  Int,
  Ctx,
  UseMiddleware,
} from "type-graphql";

import { Length, MaxLength } from "class-validator";
import { Workflow, RoleType, ModelStage } from "@generated/type-graphql";
import { AppContext, AuthRoleContext } from "../../../types";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { UserInputError } from "apollo-server-express";
import { findWorkflowByName } from "../helper";
import { ModelStage as DbModelStage, Prisma } from "@prisma/client";

@InputType()
class UpdateWorkflowInput {
  @Field()
  @Length(1, 128)
  name: string;

  @Field({ nullable: true })
  @MaxLength(2048)
  description?: string;

  @Field()
  @Length(1, 128)
  color: string;

  @Field(() => Boolean, { nullable: true })
  isDefaultWorkflow?: boolean;
}

@Resolver(Workflow)
export class UpdateWorkflowResolver {
  @Mutation(() => Workflow)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async updateWorkflowStage(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("workflowId", () => Int) workflowId: number,
    @Arg("stage", () => ModelStage) stage: ModelStage
  ): Promise<Workflow> {
    const workflow = await ctx.prisma.workflow.findFirstOrThrow({
      where: {
        id: workflowId,
        organizationId: ctx.me.organizationId,
      },
    });

    const allowedTransitions: { [key: string]: DbModelStage[] } = {
      [ModelStage.DRAFT]: [DbModelStage.DELETED, DbModelStage.PUBLISHED],
      [ModelStage.ARCHIVED]: [DbModelStage.DELETED, DbModelStage.PUBLISHED],
      [ModelStage.PUBLISHED]: [DbModelStage.DELETED, DbModelStage.ARCHIVED],
    };

    if (
      stage in allowedTransitions &&
      allowedTransitions[stage].indexOf(workflow.stage)
    ) {
      return ctx.prisma.workflow.update({
        where: { id: workflow.id },
        data: { stage },
      });
    }

    throw new UserInputError(`Cannot go from ${workflow.stage} to ${stage}`);
  }

  @Mutation(() => Workflow)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async updateWorkflow(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("workflowId", () => Int) workflowId: number,
    @Arg("input", () => UpdateWorkflowInput) input: UpdateWorkflowInput
  ): Promise<Workflow> {
    const updateData: Prisma.WorkflowUpdateInput = {
      name: input.name,
      description: input.description,
      isDefaultWorkflow: input.isDefaultWorkflow,
    };

    const workflow = await ctx.prisma.workflow.findFirstOrThrow({
      where: {
        id: workflowId,
        organizationId: ctx.me.organizationId,
      },
    });

    // When the name is changed we don't want to take an
    // existing one
    if (input.name && input.name !== workflow.name) {
      const existingWorkflow = await findWorkflowByName(
        input.name,
        ctx.me.organizationId
      );

      if (existingWorkflow && existingWorkflow.id !== workflow.id) {
        throw new UserInputError(
          "A workflow with the same name already exists"
        );
      }
    }

    if (input.color) {
      updateData.color = input.color;
    }

    return ctx.prisma.workflow.update({
      where: { id: workflow.id },
      data: updateData,
    });
  }
}

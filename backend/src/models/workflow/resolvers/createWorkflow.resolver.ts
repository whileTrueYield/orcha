import {
  Arg,
  Resolver,
  Mutation,
  InputType,
  Field,
  UseMiddleware,
  Ctx,
} from "type-graphql";

import { Length, MaxLength } from "class-validator";
import { Workflow, RoleType } from "@generated/type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import { UserInputError } from "apollo-server-express";
import { findWorkflowByName } from "../helper";
import { ModelStage } from "@prisma/client";

@InputType()
class CreateWorkflowInput {
  @Field()
  @Length(1, 128)
  name: string;

  @Field({ nullable: true })
  @MaxLength(2048)
  description: string;
}

@Resolver(Workflow)
export class CreateWorkflowResolver {
  @Mutation(() => Workflow)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async createWorkflow(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("input")
    input: CreateWorkflowInput
  ): Promise<Workflow> {
    const workflowUsingSameName = await findWorkflowByName(
      input.name,
      ctx.me.organizationId
    );

    if (workflowUsingSameName) {
      throw new UserInputError("A workflow with the same name already exists");
    }

    return ctx.prisma.workflow.create({
      data: {
        ...input,
        stage: ModelStage.PUBLISHED,
        organizationId: await ctx.me.organizationId,
      },
    });
  }
}

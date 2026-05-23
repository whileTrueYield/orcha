import {
  Arg,
  Resolver,
  Mutation,
  InputType,
  Field,
  UseMiddleware,
  Ctx,
  Int,
} from "type-graphql";

import { Length } from "class-validator";
import { Project } from "@generated/type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import { UserInputError } from "apollo-server-express";
import { ModelStage, Prisma } from "@prisma/client";
import { findProjectByName } from "../helper";

@InputType()
export class CreateProjectInput {
  @Field()
  @Length(1, 128)
  name: string;

  @Field(() => Int, { nullable: true })
  parentId: number | null;
}

@Resolver(Project)
export class CreateProjectResolver {
  @Mutation(() => Project)
  @UseMiddleware(hasRole([]))
  async createProject(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("input")
    input: CreateProjectInput
  ): Promise<Project> {
    const projectUsingSameName = await findProjectByName(
      input.name,
      input.parentId,
      ctx.me.organizationId
    );

    if (projectUsingSameName) {
      throw new UserInputError("This project already exists");
    }

    const projectData: Prisma.ProjectUncheckedCreateInput = {
      name: input.name,
      organizationId: ctx.me.organizationId,
      ownerId: ctx.me.roleId,
      authorId: ctx.me.roleId,
      stage: ModelStage.PUBLISHED,
    };

    if (input.parentId) {
      const parentProject = await ctx.prisma.project.findFirstOrThrow({
        where: {
          organizationId: ctx.me.organizationId,
          id: input.parentId,
        },
      });

      projectData.parentId = parentProject.id;
    }

    const project = await ctx.prisma.project.create({ data: projectData });

    return project;
  }
}

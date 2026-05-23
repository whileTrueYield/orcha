import { Arg, Resolver, Mutation, Ctx, UseMiddleware, Int } from "type-graphql";

import { Project, RoleStatus } from "@generated/type-graphql";
import { AppContext, AuthRoleContext } from "../../../types";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { getProjectDescendantIds, renameProject } from "../helper";
import { ModelStage } from "@prisma/client";
import { map } from "lodash";
import { UserInputError } from "apollo-server-express";

@Resolver(Project)
export class UpdateProjectResolver {
  @Mutation(() => Project, { deprecationReason: "Use renameProject instead" })
  @UseMiddleware(hasRole())
  async updateProjectName(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("projectId", () => Int) projectId: number,
    @Arg("name", () => String) name: string
  ): Promise<Project> {
    const project = await ctx.prisma.project.findFirstOrThrow({
      where: {
        organizationId: ctx.me.organizationId,
        id: projectId,
      },
    });

    return renameProject(project, name);
  }

  @Mutation(() => Project)
  @UseMiddleware(hasRole())
  async moveProjectToRoot(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("projectId", () => Int) projectId: number
  ): Promise<Project> {
    const project = await ctx.prisma.project.findFirstOrThrow({
      where: {
        organizationId: ctx.me.organizationId,
        id: projectId,
      },
    });

    return await ctx.prisma.project.update({
      where: { id: project.id },
      data: { parentId: null },
    });
  }

  @Mutation(() => Boolean)
  @UseMiddleware(hasRole())
  async moveIntoProject(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("sources", () => [String]) sources: string[],
    @Arg("projectId", () => Int) projectId: number
  ): Promise<boolean> {
    // parse all the sources
    const ticketIds: number[] = [];
    const projectIds: number[] = [];

    const project = await ctx.prisma.project.findFirstOrThrow({
      where: {
        organizationId: ctx.me.organizationId,
        id: projectId,
        stage: { not: ModelStage.DELETED },
      },
    });

    if (project.stage === ModelStage.ARCHIVED || project.ancestorIsArchived) {
      throw new UserInputError(
        "Cannot move a project or ticket inside an archived project"
      );
    }

    if (project.stage === ModelStage.DRAFT) {
      throw new UserInputError(
        "Cannot move a project or ticket inside a draft project"
      );
    }

    if (project.stage !== ModelStage.PUBLISHED) {
      throw new UserInputError(
        "Cannot move a project or ticket inside an unpublished project"
      );
    }

    for (const source of sources) {
      const [sourceType, sourceId] = source.split(":");

      switch (sourceType) {
        case "ticket":
          ticketIds.push(parseInt(sourceId, 10));
          break;
        case "project":
          projectIds.push(parseInt(sourceId, 10));
          break;
      }
    }

    // get list of child project names for the destination project
    const reservedNames = await ctx.prisma.project
      .findMany({
        select: { name: true },
        where: { parentId: projectId },
      })
      .then((v) => map(v, "name"));

    // let make sure no project movement creates a circular dependency
    for (const id of projectIds) {
      if (id === projectId) {
        throw new Error("Cannot move a project into itself");
      }
      const childrenIds = await getProjectDescendantIds(id);
      if (childrenIds.indexOf(projectId) > -1) {
        throw new Error("Cannot move a project into one of its children");
      }

      // check if there is a name conflict between project and destination
      const conflictingName = await ctx.prisma.project.findFirst({
        select: { name: true },
        where: { id, name: { in: reservedNames, mode: "insensitive" } },
      });

      if (conflictingName) {
        throw new UserInputError(
          `Cannot move project: ${conflictingName.name} already exists at this location`
        );
      }
    }

    // move the tickets
    await ctx.prisma.ticket.updateMany({
      where: {
        organizationId: ctx.me.organizationId,
        id: { in: ticketIds },
      },
      data: {
        projectId: project.id,
      },
    });

    // move the projects
    await ctx.prisma.project.updateMany({
      where: {
        organizationId: ctx.me.organizationId,
        id: { in: projectIds },
      },
      data: {
        parentId: project.id,
      },
    });

    return true;
  }

  @Mutation(() => Project)
  @UseMiddleware(hasRole())
  async renameProject(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("projectId", () => Int) projectId: number,
    @Arg("name", () => String) name: string
  ): Promise<Project> {
    const project = await ctx.prisma.project.findFirstOrThrow({
      where: {
        organizationId: ctx.me.organizationId,
        id: projectId,
      },
    });

    return renameProject(project, name);
  }

  /**
   * Publish a project, the project must be in the Draft stage
   */
  @Mutation(() => Project)
  @UseMiddleware(hasRole())
  async publishProject(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("projectId", () => Int) projectId: number
  ): Promise<Project> {
    const project = await ctx.prisma.project.findFirstOrThrow({
      where: {
        organizationId: ctx.me.organizationId,
        id: projectId,
        stage: ModelStage.DRAFT,
      },
    });

    return ctx.prisma.project.update({
      where: { id: project.id },
      data: {
        stage: ModelStage.PUBLISHED,
      },
    });
  }

  @Mutation(() => Project)
  @UseMiddleware(hasRole())
  async updateProjectOwner(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("projectId", () => Int) projectId: number,
    @Arg("ownerId", () => Int, { nullable: true }) ownerId: number | null
  ): Promise<Project> {
    const project = await ctx.prisma.project.findFirstOrThrow({
      where: {
        organizationId: ctx.me.organizationId,
        id: projectId,
      },
    });

    if (ownerId === null) {
      return ctx.prisma.project.update({
        where: { id: project.id },
        data: { ownerId: ownerId },
      });
    }

    const owner = await ctx.prisma.role.findFirstOrThrow({
      where: {
        id: ownerId,
        organizationId: ctx.me.organizationId,
        status: RoleStatus.ACCEPTED,
      },
    });

    return ctx.prisma.project.update({
      where: { id: project.id },
      data: { ownerId: owner.id },
    });
  }
}

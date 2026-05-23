import { Arg, Resolver, Mutation, Int, UseMiddleware, Ctx } from "type-graphql";
import { Project, RoleType } from "@generated/type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import { ModelStage, TicketStatus } from "@prisma/client";
import { UserInputError } from "apollo-server-express";
import { getProjectDescendantIds } from "../helper";
import prisma from "../../../prisma";

@Resolver(Project)
export class DeleteProjectResolver {
  @Mutation(() => Boolean)
  @UseMiddleware(hasRole())
  async deleteProject(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("projectId", () => Int) projectId: number
  ): Promise<boolean> {
    const project = await ctx.prisma.project.findFirstOrThrow({
      where: {
        organizationId: ctx.me.organizationId,
        id: projectId,
        stage: {
          in: [ModelStage.PUBLISHED, ModelStage.DRAFT, ModelStage.ARCHIVED],
        },
      },
    });

    // cannot have any project under it
    const subProjects = await ctx.prisma.project.count({
      where: {
        organizationId: ctx.me.organizationId,
        parentId: project.id,
      },
    });

    if (subProjects) {
      throw new UserInputError("Cannot delete a project with sub-projects");
    }

    // cannot have any ticket under it
    const subTickets = await ctx.prisma.ticket.count({
      where: {
        organizationId: ctx.me.organizationId,
        projectId: project.id,
      },
    });

    if (subTickets) {
      throw new UserInputError("Cannot delete a project containing tickets");
    }

    await ctx.prisma.project.delete({ where: { id: project.id } });

    return true;
  }

  @Mutation((_returns) => Project)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async archiveProject(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("projectId", () => Int!) projectId: number
  ): Promise<Project> {
    const project = await ctx.prisma.project.findFirstOrThrow({
      where: {
        id: projectId,
        organizationId: ctx.me.organizationId,
        stage: { in: [ModelStage.PUBLISHED, ModelStage.DRAFT] },
      },
    });

    const projectIds = await getProjectDescendantIds(project.id);

    const scheduleTickets = await prisma.ticket.count({
      where: {
        organizationId: ctx.me.organizationId,
        stage: ModelStage.PUBLISHED,
        status: TicketStatus.SCHEDULED,
        projectId: { in: [...projectIds, project.id] },
      },
    });

    if (scheduleTickets > 0) {
      throw new UserInputError(
        "Project contains scheduled tickets, unschedule tickets first."
      );
    }

    // Note that archiving a project will trigger a chain reaction
    // on the sub-project and update their ancestorIsArchived accordingly
    return ctx.prisma.project.update({
      where: {
        id: project.id,
      },
      data: {
        stage: ModelStage.ARCHIVED,
      },
    });
  }

  @Mutation((_returns) => Project)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async unarchiveProject(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("projectId", () => Int!) projectId: number
  ): Promise<Project> {
    const project = await ctx.prisma.project.findFirstOrThrow({
      where: {
        id: projectId,
        organizationId: ctx.me.organizationId,
        stage: ModelStage.ARCHIVED,
      },
    });

    // Note that unarchiving a project will trigger a chain reaction
    // on the sub-project and update their ancestorIsArchived accordingly
    // sub-project might not become unarchived if an ancestor is still archived
    return ctx.prisma.project.update({
      where: {
        id: project.id,
      },
      data: {
        stage: ModelStage.PUBLISHED,
      },
    });
  }
}

import { Arg, Query, Resolver, Int, UseMiddleware, Ctx } from "type-graphql";

import { Project } from "@generated/type-graphql";
import { AppContext, AuthRoleContext } from "../../../types";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { PaginatedProjects } from "../entity";
import { getPaginatedProjects } from "../helper";

@Resolver(Project)
export class ProjectsResolver {
  @Query((_returns) => PaginatedProjects)
  @UseMiddleware(hasRole())
  async projects(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("first", () => Int, { nullable: true }) first: number,
    @Arg("last", () => Int, { nullable: true }) last: number,
    @Arg("offset", () => Int, { nullable: true }) offset: number,
    @Arg("sort", () => String, { nullable: true }) sort: keyof Project,
    @Arg("search", () => String, { nullable: true }) search: string,
    @Arg("parentId", () => Int, { nullable: true }) parentId: number
  ): Promise<PaginatedProjects> {
    return getPaginatedProjects({
      organizationId: ctx.me.organizationId,
      first,
      last,
      offset,
      sort,
      search,
      parentId,
    });
  }

  @Query((_returns) => [Project], {
    description: "The user's own projects and drafts",
  })
  @UseMiddleware(hasRole())
  async myProjects(
    @Ctx() ctx: AppContext<AuthRoleContext>
  ): Promise<Project[]> {
    return ctx.prisma.project.findMany({
      where: {
        organizationId: ctx.me.organizationId,
        ownerId: ctx.me.roleId,
      },
      include: {
        author: true,
        owner: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}

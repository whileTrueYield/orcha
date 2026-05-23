import { Query, Resolver, UseMiddleware, Ctx, Arg } from "type-graphql";
import { MiniProject } from "../entity";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import { ModelStage, Prisma } from "@prisma/client";

@Resolver(MiniProject)
export class MiniProjectResolver {
  @Query((_returns) => [MiniProject])
  @UseMiddleware(hasRole())
  async miniProjects(
    @Ctx() ctx: AppContext<AuthRoleContext>
  ): Promise<MiniProject[]> {
    return ctx.prisma.project.findMany({
      where: {
        organizationId: ctx.me.organizationId,
        stage: ModelStage.PUBLISHED,
        ancestorIsArchived: false,
      },
      select: {
        id: true,
        name: true,
        parentId: true,
        stage: true,
        ancestorIsArchived: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  @Query((_returns) => [MiniProject])
  @UseMiddleware(hasRole())
  async myMiniProjects(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("includeArchived", () => Boolean, { nullable: true })
    includeArchived: boolean
  ): Promise<MiniProject[]> {
    const where: Prisma.ProjectWhereInput = {
      organizationId: ctx.me.organizationId,
    };

    if (includeArchived) {
      where.OR = [
        { stage: { in: [ModelStage.PUBLISHED, ModelStage.ARCHIVED] } },
        {
          authorId: ctx.me.roleId,
          stage: ModelStage.DRAFT,
        },
      ];
    } else {
      where.ancestorIsArchived = false;
      where.OR = [
        {
          stage: ModelStage.PUBLISHED,
        },
        {
          authorId: ctx.me.roleId,
          stage: ModelStage.DRAFT,
        },
      ];
    }

    return ctx.prisma.project.findMany({
      where,
      select: {
        id: true,
        name: true,
        parentId: true,
        stage: true,
        ancestorIsArchived: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  }
}

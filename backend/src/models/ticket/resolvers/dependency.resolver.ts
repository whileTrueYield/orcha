import { ModelStage } from "@generated/type-graphql";
import { Prisma, TicketStatus } from "@prisma/client";
import { Arg, Ctx, Int, Query, Resolver, UseMiddleware } from "type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import { getProjectDescendantIds } from "../../project/helper";
import { DependencySet } from "../entity";

@Resolver((_of) => DependencySet)
export class DependencySetResolver {
  @Query((_returns) => DependencySet)
  @UseMiddleware(hasRole())
  async dependencies(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("projectId", () => Int, { nullable: true }) projectId?: number
  ): Promise<DependencySet> {
    const ticketWhere: Prisma.TicketWhereInput = {
      organizationId: ctx.me.organizationId,
      stage: ModelStage.PUBLISHED,
      status: { in: [TicketStatus.SCHEDULED, TicketStatus.UNSCHEDULED] },
    };

    const projectWhere: Prisma.ProjectWhereInput = {
      organizationId: ctx.me.organizationId,
    };

    if (projectId) {
      const projectIds = [
        projectId,
        ...(await getProjectDescendantIds(projectId)),
      ];
      ticketWhere.projectId = { in: projectIds };
      projectWhere.id = { in: projectIds };
    }

    const tickets = await ctx.prisma.ticket.findMany({
      where: { ...ticketWhere },
      include: {
        ancestors: {
          select: { id: true },
          where: { stage: ModelStage.PUBLISHED },
        },
        successors: {
          select: { id: true },
          where: { stage: ModelStage.PUBLISHED },
        },
        product: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    const projects = await ctx.prisma.project.findMany({ where: projectWhere });

    return {
      tickets: tickets.map((t) => ({
        id: t.id,
        localId: t.localId,
        productCode: t.product?.code,
        title: t.title,
        projectId: t.projectId,
        status: t.status,
        successors: t.successors.map(({ id }) => id),
        ancestors: t.ancestors.map(({ id }) => id),
        milestone: t.milestone,
      })),
      projects: projects.map((project) => ({
        id: project.id,
        name: project.name,
        parentId: project.parentId,
        // in case we start having project dependencies (which we should!)
        successors: [],
        ancestors: [],
      })),
    };
  }
}

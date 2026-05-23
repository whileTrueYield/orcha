import {
  Arg,
  Ctx,
  FieldResolver,
  Int,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import { ProjectAnalytics } from "../entity";
import {
  getTicketQueryForDone,
  getTicketQueryForDraft,
  getTicketQueryForEstimated,
  getTicketQueryForInProgress,
  getTicketQueryForScheduled,
  getTicketQueryForUnassigned,
  getTicketQueryForUnestimated,
} from "../helper";

@Resolver(ProjectAnalytics)
export class ProjectAnalyticsResolver {
  @Query(() => ProjectAnalytics, { nullable: true })
  @UseMiddleware(hasRole())
  async projectAnalytics(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("projectId", () => Int) projectId: number
  ): Promise<ProjectAnalytics> {
    return {
      projectId,
      organizationId: ctx.me.organizationId,
      scheduledTicketCount: 0,
      draftTicketCount: 0,
      inProgressTicketCount: 0,
      doneTicketCount: 0,
      unassignedTicketCount: 0,
      estimatedTicketCount: 0,
      unestimatedTicketCount: 0,
    };
  }

  @FieldResolver((_returns) => Int)
  async unestimatedTicketCount(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() projectAnalytics: ProjectAnalytics
  ): Promise<number> {
    return ctx.prisma.ticket.count({
      where: await getTicketQueryForUnestimated(
        projectAnalytics.organizationId,
        projectAnalytics.projectId
      ),
    });
  }

  @FieldResolver((_returns) => Int)
  async scheduledTicketCount(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() projectAnalytics: ProjectAnalytics
  ): Promise<number> {
    return ctx.prisma.ticket.count({
      where: await getTicketQueryForScheduled(
        projectAnalytics.organizationId,
        projectAnalytics.projectId
      ),
    });
  }

  @FieldResolver((_returns) => Int)
  async draftTicketCount(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() projectAnalytics: ProjectAnalytics
  ): Promise<number> {
    return ctx.prisma.ticket.count({
      where: await getTicketQueryForDraft(
        projectAnalytics.organizationId,
        projectAnalytics.projectId
      ),
    });
  }

  @FieldResolver((_returns) => Int)
  async inProgressTicketCount(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() projectAnalytics: ProjectAnalytics
  ): Promise<number> {
    return ctx.prisma.ticket.count({
      where: await getTicketQueryForInProgress(
        projectAnalytics.organizationId,
        projectAnalytics.projectId
      ),
    });
  }

  @FieldResolver((_returns) => Int)
  async doneTicketCount(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() projectAnalytics: ProjectAnalytics
  ): Promise<number> {
    return ctx.prisma.ticket.count({
      where: await getTicketQueryForDone(
        projectAnalytics.organizationId,
        projectAnalytics.projectId
      ),
    });
  }

  @FieldResolver((_returns) => Int)
  async unassignedTicketCount(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() projectAnalytics: ProjectAnalytics
  ): Promise<number> {
    return ctx.prisma.ticket.count({
      where: await getTicketQueryForUnassigned(
        projectAnalytics.organizationId,
        projectAnalytics.projectId
      ),
    });
  }

  @FieldResolver((_returns) => Int)
  async estimatedTicketCount(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() projectAnalytics: ProjectAnalytics
  ): Promise<number> {
    return ctx.prisma.ticket.count({
      where: await getTicketQueryForEstimated(
        projectAnalytics.organizationId,
        projectAnalytics.projectId
      ),
    });
  }
}

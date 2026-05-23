import {
  Arg,
  Query,
  Resolver,
  Int,
  FieldResolver,
  Root,
  Ctx,
  UseMiddleware,
  Mutation,
} from "type-graphql";
import {
  Report,
  Organization,
  RoleType,
  ReportQuery,
} from "@generated/type-graphql";
import { AuthRoleContext, AppContext } from "../../../types";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { UserInputError } from "apollo-server-express";
import { FeatureFlags, hasFeature } from "../../../middlewares/featureFlag";

@Resolver(Report)
export class ReportResolver {
  @Query(() => Report)
  @UseMiddleware(hasRole())
  @UseMiddleware(hasFeature(FeatureFlags.REPORT))
  async report(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("id", () => Int) id: number
  ): Promise<Report> {
    const report = await ctx.prisma.report.findFirst({
      where: {
        id,
        organizationId: ctx.me.organizationId,
      },
      include: {
        reportQueries: {
          include: {
            byAssignees: true,
            byAuthors: true,
            byFeatures: true,
            byOwners: true,
            byProducts: true,
            byTags: true,
            byTickets: true,
            byWorkflows: true,
            byWorkflowStateAssignees: true,
            byWorkflowStates: true,

            secondaryByAssignees: true,
            secondaryByAuthors: true,
            secondaryByFeatures: true,
            secondaryByOwners: true,
            secondaryByProducts: true,
            secondaryByTags: true,
            secondaryByTickets: true,
            secondaryByWorkflows: true,
            secondaryByWorkflowStateAssignees: true,
            secondaryByWorkflowStates: true,
          },
          orderBy: { position: "asc" },
        },
      },
    });

    if (!report) {
      throw new UserInputError(
        "This report does not exist or has been deleted"
      );
    }

    return report;
  }

  @FieldResolver((_returns) => Organization)
  async organization(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() report: Report
  ): Promise<Organization> {
    if (report.organization) {
      return report.organization;
    }
    return ctx.prisma.organization.findUniqueOrThrow({
      where: { id: report.organizationId },
    });
  }

  @FieldResolver((_returns) => [ReportQuery])
  async queries(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() report: Report
  ): Promise<ReportQuery[]> {
    if (report.reportQueries) {
      return report.reportQueries;
    }
    return ctx.prisma.reportQuery.findMany({
      where: { reportId: report.id },
      orderBy: { position: "asc" },
    });
  }

  @Mutation((_returns) => Report)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async deleteReportQuery(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("reportQueryId", () => Int!) reportQueryId: number
  ): Promise<Report> {
    const reportQuery = await ctx.prisma.reportQuery.findFirstOrThrow({
      where: {
        id: reportQueryId,
        organizationId: ctx.me.organizationId,
      },
    });

    const reportId = reportQuery.reportId;

    await ctx.prisma.reportQuery.delete({
      where: { id: reportQuery.id },
    });

    return ctx.prisma.report.findFirstOrThrow({
      where: { id: reportId },
    });
  }
}

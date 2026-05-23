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
import { Report } from "@generated/type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import { ModelStage } from "@prisma/client";
import { FeatureFlags, hasFeature } from "../../../middlewares/featureFlag";
import { map, omit } from "lodash";

@InputType()
class CreateReportInput {
  @Field()
  @Length(1, 128)
  name: string;
}

@InputType()
class DuplicateReportInput {
  @Field()
  @Length(1, 128)
  name: string;
}

@Resolver(Report)
export class CreateReportResolver {
  @Mutation(() => Report)
  @UseMiddleware(hasRole())
  @UseMiddleware(hasFeature(FeatureFlags.REPORT))
  async createReport(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("input")
    input: CreateReportInput
  ): Promise<Report> {
    const report = await ctx.prisma.report.create({
      data: {
        ...input,
        organizationId: ctx.me.organizationId,
        stage: ModelStage.DRAFT,
      },
    });

    return report;
  }

  @Mutation((_returns) => Report)
  @UseMiddleware(hasRole())
  @UseMiddleware(hasFeature(FeatureFlags.REPORT))
  async duplicateReport(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("reportId", () => Int!) reportId: number,
    @Arg("input")
    input: DuplicateReportInput
  ): Promise<Report> {
    const report = await ctx.prisma.report.findFirstOrThrow({
      where: {
        id: reportId,
        organizationId: ctx.me.organizationId,
      },
    });

    const reportQueries = await ctx.prisma.reportQuery.findMany({
      where: {
        id: reportId,
        organizationId: ctx.me.organizationId,
      },
    });

    // create a new report with the same settings
    const duplicatedReport = await ctx.prisma.report.create({
      data: {
        ...omit(report, ["id", "stage", "createdAt", "updatedAt"]),
        ...input,
        stage: ModelStage.DRAFT,
      },
    });

    // duplicate the queries
    await ctx.prisma.reportQuery.createMany({
      data: map(reportQueries, (reportQuery) => ({
        ...omit(reportQuery, ["id", "reportId", "createdAt", "updatedAt"]),
        reportId: duplicatedReport.id,
      })),
    });

    return duplicatedReport;
  }
}

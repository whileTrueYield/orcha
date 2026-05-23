import { Arg, Resolver, Mutation, Int, UseMiddleware, Ctx } from "type-graphql";

import { Report, RoleType } from "@generated/type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import { ModelStage } from "@prisma/client";
import { FeatureFlags, hasFeature } from "../../../middlewares/featureFlag";

@Resolver(Report)
export class DeleteReportResolver {
  @Mutation((_returns) => Report)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  @UseMiddleware(hasFeature(FeatureFlags.REPORT))
  async deleteReport(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("reportId", () => Int!) reportId: number
  ): Promise<Report> {
    const report = await ctx.prisma.report.findFirstOrThrow({
      where: {
        id: reportId,
        organizationId: ctx.me.organizationId,
      },
    });

    return ctx.prisma.report.update({
      where: { id: report.id },
      data: { stage: ModelStage.DELETED },
    });
  }
}

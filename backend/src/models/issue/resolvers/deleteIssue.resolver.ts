import { Arg, Resolver, Mutation, Int, UseMiddleware, Ctx } from "type-graphql";

import { Issue } from "@generated/type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import { RoleType } from "@prisma/client";
import { FeatureFlags, hasFeature } from "../../../middlewares/featureFlag";

@Resolver(Issue)
export class DeleteIssueResolver {
  @Mutation((_returns) => Issue)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  @UseMiddleware(hasFeature(FeatureFlags.SUPPORT))
  async deleteIssue(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("issueId", () => Int!) issueId: number
  ): Promise<Issue> {
    const issue = await ctx.prisma.issue.findFirstOrThrow({
      where: {
        id: issueId,
        organizationId: ctx.me.organizationId,
      },
    });

    return ctx.prisma.issue.delete({ where: { id: issue.id } });
  }
}

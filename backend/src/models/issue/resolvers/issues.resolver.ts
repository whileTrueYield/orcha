import { Arg, Query, Resolver, Int, UseMiddleware, Ctx } from "type-graphql";

import { Issue, IssueStatus } from "@generated/type-graphql";
import { AppContext, AuthRoleContext } from "../../../types";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { getPaginatedIssues } from "../helper";
import { PaginatedIssues } from "../entity";
import { FeatureFlags, hasFeature } from "../../../middlewares/featureFlag";

@Resolver(Issue)
export class IssuesResolver {
  @Query((_returns) => PaginatedIssues)
  @UseMiddleware(hasRole())
  @UseMiddleware(hasFeature(FeatureFlags.SUPPORT))
  async issues(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("first", () => Int, { nullable: true }) first?: number,
    @Arg("last", () => Int, { nullable: true }) last?: number,
    @Arg("offset", () => Int, { nullable: true }) offset?: number,
    @Arg("sort", () => String, { nullable: true }) sort?: keyof Issue,
    @Arg("search", () => String, { nullable: true }) search?: string,
    @Arg("productId", () => Int, { nullable: true }) productId?: number,
    @Arg("unread", () => Boolean, { nullable: true }) unread?: boolean,
    @Arg("unassigned", () => Boolean, { nullable: true }) unassigned?: boolean,
    @Arg("assigneeId", () => Int, { nullable: true }) assigneeId?: number,
    @Arg("statuses", () => [IssueStatus], { nullable: true })
    statuses?: IssueStatus[]
  ) {
    return getPaginatedIssues({
      organizationId: ctx.me.organizationId,
      productId,
      unread,
      assigneeId,
      unassigned,
      statuses,
      first,
      last,
      offset,
      sort,
      search,
    });
  }
}

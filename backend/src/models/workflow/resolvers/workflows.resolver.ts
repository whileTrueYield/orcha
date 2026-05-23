import { Arg, Query, Resolver, Int, UseMiddleware, Ctx } from "type-graphql";

import { Workflow, ModelStage } from "@generated/type-graphql";
import { AppContext, AuthRoleContext } from "../../../types";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { PaginatedWorkflows } from "../entity";
import { getPaginatedWorkflows } from "../helper";

@Resolver(Workflow)
export class WorkflowsResolver {
  @Query((_returns) => PaginatedWorkflows)
  @UseMiddleware(hasRole())
  async workflows(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("first", () => Int, { nullable: true }) first: number,
    @Arg("last", () => Int, { nullable: true }) last: number,
    @Arg("offset", () => Int, { nullable: true }) offset: number,
    @Arg("sort", () => String, { nullable: true }) sort: keyof Workflow,
    @Arg("search", () => String, { nullable: true }) search: string,
    @Arg("stages", () => [ModelStage], { nullable: true }) stages: ModelStage[]
  ): Promise<PaginatedWorkflows> {
    return getPaginatedWorkflows({
      organizationId: ctx.me.organizationId,
      first,
      last,
      offset,
      sort,
      search,
      stages,
    });
  }
}

import { Query, Resolver, UseMiddleware, Ctx, Int, Arg } from "type-graphql";
import { MiniWorkflow } from "../entity";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import { ModelStage } from "@generated/type-graphql";
import { getWorkflowQueryForProduct, toMiniWorkflow } from "../helper";

@Resolver(MiniWorkflow)
export class MiniWorkflowsResolver {
  @Query((_returns) => [MiniWorkflow])
  @UseMiddleware(hasRole())
  async miniWorkflows(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("productId", () => Int, { nullable: true }) productId?: number
  ): Promise<MiniWorkflow[]> {
    if (productId) {
      const product = await ctx.prisma.product.findFirstOrThrow({
        where: {
          organizationId: ctx.me.organizationId,
          id: productId,
          stage: { not: ModelStage.DELETED },
        },
      });

      const workflows = await ctx.prisma.workflow.findMany({
        where: getWorkflowQueryForProduct(product),
      });

      return workflows.map(toMiniWorkflow);
    } else {
      const workflows = await ctx.prisma.workflow.findMany({
        where: {
          organizationId: ctx.me.organizationId,
          stage: { not: ModelStage.DELETED },
        },
      });

      return workflows.map(toMiniWorkflow);
    }
  }
}

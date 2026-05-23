import { Arg, Resolver, Mutation, Int, UseMiddleware, Ctx } from "type-graphql";

import { Workflow, RoleType, ModelStage } from "@generated/type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";

@Resolver(Workflow)
export class DeleteWorkflowResolver {
  @Mutation((_returns) => Workflow, {
    deprecationReason: "Archive workflow instead of deleting it",
  })
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async deleteWorkflow(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("workflowId", () => Int!) workflowId: number
  ): Promise<Workflow> {
    const workflow = await ctx.prisma.workflow.findFirstOrThrow({
      where: {
        id: workflowId,
        organizationId: ctx.me.organizationId,
      },
    });

    return ctx.prisma.workflow.update({
      where: { id: workflow.id },
      data: { stage: ModelStage.DELETED },
    });
  }
}

import { Arg, Resolver, Mutation, Int, UseMiddleware, Ctx } from "type-graphql";

import { Documentation, RoleType } from "@generated/type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import { ModelStage } from "@prisma/client";
import { FeatureFlags, hasFeature } from "../../../middlewares/featureFlag";

@Resolver(Documentation)
export class DeleteDocumentationResolver {
  @Mutation((_returns) => Documentation)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  @UseMiddleware(hasFeature(FeatureFlags.DOCUMENTATION))
  async deleteDocumentation(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("documentationId", () => Int!) documentationId: number
  ): Promise<Documentation> {
    const documentation = await ctx.prisma.documentation.findFirstOrThrow({
      where: {
        id: documentationId,
        organizationId: ctx.me.organizationId,
      },
    });

    return ctx.prisma.documentation.update({
      where: { id: documentation.id },
      data: { stage: ModelStage.DELETED },
    });
  }
}

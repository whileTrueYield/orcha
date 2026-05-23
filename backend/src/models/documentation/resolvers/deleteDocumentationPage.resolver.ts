import { Arg, Resolver, Mutation, Int, UseMiddleware, Ctx } from "type-graphql";

import { DocumentationPage, RoleType } from "@generated/type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import { FeatureFlags, hasFeature } from "../../../middlewares/featureFlag";

@Resolver(DocumentationPage)
export class DeleteDocumentationPageResolver {
  @Mutation((_returns) => DocumentationPage)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  @UseMiddleware(hasFeature(FeatureFlags.DOCUMENTATION))
  async deleteDocumentationPage(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("documentationPageId", () => Int!) documentationPageId: number
  ): Promise<DocumentationPage> {
    const documentationPage =
      await ctx.prisma.documentationPage.findFirstOrThrow({
        where: {
          id: documentationPageId,
          organizationId: ctx.me.organizationId,
        },
      });

    return ctx.prisma.documentationPage.delete({
      where: { id: documentationPage.id },
    });
  }
}

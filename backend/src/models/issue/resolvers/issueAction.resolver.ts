import { Resolver, FieldResolver, Root, Ctx } from "type-graphql";
import { Organization, Role, IssueAction } from "@generated/type-graphql";
import { AuthRoleContext, AppContext } from "../../../types";

@Resolver(IssueAction)
export class IssueActionResolver {
  @FieldResolver((_returns) => Organization)
  async organization(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() issueAction: IssueAction
  ): Promise<Organization> {
    if (issueAction.organization) {
      return issueAction.organization;
    }

    return ctx.prisma.organization.findUniqueOrThrow({
      where: { id: issueAction.organizationId },
    });
  }

  @FieldResolver((_returns) => Role, { nullable: true })
  async author(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() issueAction: IssueAction
  ): Promise<Role | null> {
    if (issueAction.authorId) {
      if (issueAction.author) {
        return issueAction.author;
      }

      return ctx.prisma.role.findUnique({
        where: { id: issueAction.authorId },
      });
    }

    return null;
  }
}

import { Query, Resolver, UseMiddleware, Ctx } from "type-graphql";
import { MiniRole } from "../entity";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import { RoleStatus } from "@generated/type-graphql";

@Resolver(MiniRole)
export class MiniRoleResolver {
  @Query((_returns) => [MiniRole])
  @UseMiddleware(hasRole())
  async miniRoles(
    @Ctx() ctx: AppContext<AuthRoleContext>
  ): Promise<MiniRole[]> {
    return ctx.prisma.role.findMany({
      where: {
        organizationId: ctx.me.organizationId,
        status: { in: [RoleStatus.ACCEPTED, RoleStatus.INVITED] },
      },
      select: {
        id: true,
        name: true,
        title: true,
        avatarUrl: true,
      },
    });
  }
}

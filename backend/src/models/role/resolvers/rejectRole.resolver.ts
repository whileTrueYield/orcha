import { Arg, Resolver, Mutation, Int, UseMiddleware, Ctx } from "type-graphql";

import { Role, RoleStatus } from "@generated/type-graphql";
import { isAuthenticated } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthUserContext } from "../../../types";

@Resolver(Role)
export class RejectRoleResolver {
  @Mutation((_type) => Role)
  @UseMiddleware(isAuthenticated)
  async rejectRole(
    @Ctx() ctx: AppContext<AuthUserContext>,
    @Arg("roleId", () => Int!) roleId: number
  ): Promise<Role> {
    const role = await ctx.prisma.role.findFirstOrThrow({
      where: {
        id: roleId,
        userId: ctx.me.userId,
        status: RoleStatus.INVITED,
      },
    });

    return ctx.prisma.role.update({
      where: { id: role.id },
      data: { status: RoleStatus.REJECTED },
    });
  }
}

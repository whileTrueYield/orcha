import { Arg, Resolver, Mutation, Int, UseMiddleware, Ctx } from "type-graphql";

import { ScheduleItem, RoleType } from "@generated/type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";

@Resolver(ScheduleItem)
export class DeleteScheduleItemResolver {
  @Mutation((_returns) => Boolean)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async deleteScheduleItem(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("scheduleItemId", () => Int!) scheduleItemId: number
  ): Promise<boolean> {
    const scheduleItem = await ctx.prisma.scheduleItem.findFirstOrThrow({
      where: {
        id: scheduleItemId,
        organizationId: ctx.me.organizationId,
        roleId: ctx.me.roleId,
      },
    });

    if (scheduleItem) {
      await ctx.prisma.scheduleItem.delete({ where: { id: scheduleItem.id } });
      return true;
    }

    return false;
  }
}

import { Arg, Resolver, Mutation, Int, UseMiddleware, Ctx } from "type-graphql";

import { Notification } from "@generated/type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";

@Resolver(Notification)
export class DeleteNotificationResolver {
  @Mutation((_returns) => Notification)
  @UseMiddleware(hasRole([]))
  async deleteNotification(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("notificationId", () => Int!) notificationId: number
  ): Promise<Notification> {
    const notification = await ctx.prisma.notification.findFirstOrThrow({
      where: {
        id: notificationId,
        organizationId: ctx.me.organizationId,
        roleId: ctx.me.roleId,
      },
    });

    return ctx.prisma.notification.delete({ where: { id: notification.id } });
  }
}

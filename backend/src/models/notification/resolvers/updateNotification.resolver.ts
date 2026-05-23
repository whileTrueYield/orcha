import { Arg, Resolver, Mutation, Int, Ctx, UseMiddleware } from "type-graphql";

import { Notification } from "@generated/type-graphql";
import { AppContext, AuthRoleContext } from "../../../types";
import { hasRole } from "../../../middlewares/isAuthenticated";

@Resolver(Notification)
export class UpdateNotificationResolver {
  @Mutation(() => Notification)
  @UseMiddleware(hasRole())
  async readNotification(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("notificationId", () => Int) notificationId: number
  ): Promise<Notification> {
    const notification = await ctx.prisma.notification.findFirstOrThrow({
      where: {
        organizationId: ctx.me.organizationId,
        id: notificationId,
        roleId: ctx.me.roleId,
      },
    });

    return ctx.prisma.notification.update({
      where: { id: notification.id },
      data: { isRead: true },
    });
  }

  @Mutation(() => Notification)
  @UseMiddleware(hasRole())
  async unreadNotification(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("notificationId", () => Int) notificationId: number
  ): Promise<Notification> {
    const notification = await ctx.prisma.notification.findFirstOrThrow({
      where: {
        organizationId: ctx.me.organizationId,
        id: notificationId,
        roleId: ctx.me.roleId,
      },
    });

    return ctx.prisma.notification.update({
      where: { id: notification.id },
      data: { isRead: false },
    });
  }
}

import {
  Arg,
  Query,
  Resolver,
  Int,
  FieldResolver,
  Root,
  Ctx,
  UseMiddleware,
} from "type-graphql";
import { Notification, Organization, Role } from "@generated/type-graphql";
import { AuthRoleContext, AppContext } from "../../../types";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { UserInputError } from "apollo-server-express";

@Resolver(Notification)
export class NotificationResolver {
  @Query(() => Notification!)
  @UseMiddleware(hasRole())
  async notification(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("id", () => Int) id: number
  ): Promise<Notification> {
    const notification = await ctx.prisma.notification.findFirst({
      where: {
        id,
        organizationId: ctx.me.organizationId,
        roleId: ctx.me.roleId,
      },
      include: { role: true },
    });

    if (!notification) {
      throw new UserInputError(
        "This notification does not exist or has been deleted"
      );
    }

    return notification;
  }

  @Query(() => Notification, { nullable: true })
  @UseMiddleware(hasRole())
  async lastNotification(
    @Ctx() ctx: AppContext<AuthRoleContext>
  ): Promise<Notification | null> {
    return ctx.prisma.notification.findFirst({
      where: {
        organizationId: ctx.me.organizationId,
        roleId: ctx.me.roleId,
      },
      include: { role: true },
      orderBy: { id: "desc" },
    });
  }

  @FieldResolver((_returns) => Organization)
  async organization(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() notification: Notification
  ): Promise<Organization> {
    if (notification.organization) {
      return notification.organization;
    }

    return ctx.prisma.organization.findUniqueOrThrow({
      where: { id: notification.organizationId },
    });
  }

  @FieldResolver((_returns) => Role)
  async role(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() notification: Notification
  ): Promise<Role> {
    if (notification.role) {
      return notification.role;
    }

    return ctx.prisma.role.findUniqueOrThrow({
      where: { id: notification.roleId },
    });
  }

  @FieldResolver((_returns) => Role)
  async actor(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() notification: Notification
  ): Promise<Role> {
    if (notification.actor) {
      return notification.actor;
    }

    return ctx.prisma.role.findUniqueOrThrow({
      where: { id: notification.actorId },
    });
  }
}

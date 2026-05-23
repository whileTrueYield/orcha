import { Arg, Query, Resolver, Int, UseMiddleware, Ctx } from "type-graphql";

import { Notification } from "@generated/type-graphql";
import { AppContext, AuthRoleContext } from "../../../types";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { getPaginatedNotifications } from "../helper";
import { PaginatedNotifications } from "../entity";

@Resolver(Notification)
export class NotificationsResolver {
  @Query((_returns) => PaginatedNotifications)
  @UseMiddleware(hasRole())
  async myNotifications(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("first", () => Int, { nullable: true }) first: number,
    @Arg("last", () => Int, { nullable: true }) last: number,
    @Arg("offset", () => Int, { nullable: true }) offset: number,
    @Arg("sort", () => String, { nullable: true }) sort: keyof Notification,
    @Arg("search", () => String, { nullable: true }) search: string,
    @Arg("unread", () => Boolean, { nullable: true }) unread: boolean
  ) {
    return getPaginatedNotifications({
      organizationId: ctx.me.organizationId,
      roleId: ctx.me.roleId,
      first,
      last,
      offset,
      sort,
      search,
      unread,
    });
  }
}

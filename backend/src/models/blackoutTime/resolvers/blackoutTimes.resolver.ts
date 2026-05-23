import { Arg, Ctx, Int, Query, Resolver, UseMiddleware } from "type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import { BlackoutTime } from "../../entities";
import { RoleType } from "@prisma/client";
import { PaginatedBlackoutTimes } from "../entity";
import { getPaginatedBlackoutTimes } from "../helper";

@Resolver()
export class BlackoutTimesResolver {
  @Query((_returns) => [BlackoutTime])
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async blackoutTimes(
    @Ctx() ctx: AppContext<AuthRoleContext>
  ): Promise<BlackoutTime[]> {
    return ctx.prisma.blackoutTime.findMany({
      where: {
        organizationId: ctx.me.organizationId,
        stopAt: { gte: new Date() },
      },
      include: {
        roles: true,
      },
    });
  }

  @Query((_returns) => PaginatedBlackoutTimes)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async paginatedBlackoutTimes(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("first", () => Int, { nullable: true }) first?: number,
    @Arg("last", () => Int, { nullable: true }) last?: number,
    @Arg("offset", () => Int, { nullable: true }) offset?: number,
    @Arg("sort", () => String, { nullable: true }) sort?: keyof BlackoutTime,
    @Arg("search", () => String, { nullable: true }) search?: string,
    @Arg("disabled", () => Boolean, { nullable: true }) disabled?: boolean
  ): Promise<PaginatedBlackoutTimes> {
    return getPaginatedBlackoutTimes({
      organizationId: ctx.me.organizationId,
      search,
      first,
      last,
      offset,
      sort,
      disabled,
    });
  }
}

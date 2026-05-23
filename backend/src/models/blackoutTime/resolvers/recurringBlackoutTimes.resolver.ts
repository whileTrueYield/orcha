import { Arg, Ctx, Int, Query, Resolver, UseMiddleware } from "type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import { RecurringBlackoutTime } from "../../entities";
import { RoleType } from "@prisma/client";
import { PaginatedRecurringBlackoutTimes } from "../entity";
import { getPaginatedRecurringBlackoutTimes } from "../helper";

@Resolver(RecurringBlackoutTime)
export class RecurringBlackoutTimesResolver {
  @Query((_returns) => [RecurringBlackoutTime])
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async recurringBlackoutTimes(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("includeDisabled", () => Boolean, { nullable: true })
    includeDisabled?: boolean
  ): Promise<RecurringBlackoutTime[]> {
    return ctx.prisma.recurringBlackoutTime.findMany({
      where: {
        organizationId: ctx.me.organizationId,
        disabled: includeDisabled ? undefined : false,
      },
      include: {
        roles: true,
      },
      orderBy: {
        startTime: "asc",
      },
    });
  }

  @Query((_returns) => PaginatedRecurringBlackoutTimes)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async paginatedRecurringBlackoutTimes(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("search", () => String, { nullable: true }) search?: string,
    @Arg("first", () => Int, { nullable: true }) first?: number,
    @Arg("last", () => Int, { nullable: true }) last?: number,
    @Arg("offset", () => Int, { nullable: true }) offset?: number,
    @Arg("sort", () => String, { nullable: true })
    sort?: keyof RecurringBlackoutTime,
    @Arg("disabled", () => Boolean, { nullable: true }) disabled?: boolean
  ): Promise<PaginatedRecurringBlackoutTimes> {
    return getPaginatedRecurringBlackoutTimes({
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

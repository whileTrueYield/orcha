import { Arg, Ctx, Query, Resolver, UseMiddleware } from "type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import { TimeOff } from "../../entities";

@Resolver(TimeOff)
export class TimeOffsResolver {
  @Query((_returns) => [TimeOff])
  @UseMiddleware(hasRole())
  async timeOffs(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("fromDate", () => Date) fromDate: Date,
    @Arg("toDate", () => Date) toDate: Date
  ): Promise<TimeOff[]> {
    return ctx.prisma.timeOff.findMany({
      where: {
        roleId: ctx.me.roleId,
        organizationId: ctx.me.organizationId,
        startAt: { lte: toDate },
        stopAt: { gte: fromDate },
      },
    });
  }
}

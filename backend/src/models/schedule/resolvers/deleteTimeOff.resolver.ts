import { Arg, Resolver, Mutation, UseMiddleware, Ctx, Int } from "type-graphql";

import { TimeOff } from "@generated/type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import { requestEstimate } from "../../ticket/jobs/estimateTickets";

@Resolver(TimeOff)
export class DeleteTimeOffResolver {
  @Mutation(() => TimeOff)
  @UseMiddleware(hasRole())
  async deleteTimeOff(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("timeOffId", () => Int) timeOffId: number
  ): Promise<TimeOff> {
    const timeOff = await ctx.prisma.timeOff.findFirstOrThrow({
      where: {
        id: timeOffId,
        organizationId: ctx.me.organizationId,
        roleId: ctx.me.roleId,
      },
    });

    await requestEstimate(ctx.me.organizationId);

    return ctx.prisma.timeOff.delete({
      where: { id: timeOff.id },
    });
  }
}

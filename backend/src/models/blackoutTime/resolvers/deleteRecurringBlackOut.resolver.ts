import { Arg, Resolver, Mutation, UseMiddleware, Ctx, Int } from "type-graphql";

import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import { requestEstimate } from "../../ticket/jobs/estimateTickets";
import { RoleType } from "@prisma/client";

@Resolver()
export class DeleteRecurringBlackoutTimeResolver {
  @Mutation(() => Int)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async deleteRecurringBlackoutTime(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("recurringBlackoutTimeId", () => Int) recurringBlackoutTimeId: number
  ): Promise<number> {
    const recurringBlackoutTime =
      await ctx.prisma.recurringBlackoutTime.findFirstOrThrow({
        where: {
          id: recurringBlackoutTimeId,
          organizationId: ctx.me.organizationId,
        },
      });

    await requestEstimate(ctx.me.organizationId);

    await ctx.prisma.recurringBlackoutTime.delete({
      where: { id: recurringBlackoutTime.id },
    });

    return recurringBlackoutTimeId;
  }
}

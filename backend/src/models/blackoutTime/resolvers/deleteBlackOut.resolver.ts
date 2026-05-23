import { Arg, Resolver, Mutation, UseMiddleware, Ctx, Int } from "type-graphql";

import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import { requestEstimate } from "../../ticket/jobs/estimateTickets";
import { RoleType } from "@prisma/client";

@Resolver()
export class DeleteBlackoutTimeResolver {
  @Mutation(() => Int)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async deleteBlackoutTime(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("blackoutTimeId", () => Int) blackoutTimeId: number
  ): Promise<number> {
    const blackoutTime = await ctx.prisma.blackoutTime.findFirstOrThrow({
      where: {
        id: blackoutTimeId,
        organizationId: ctx.me.organizationId,
      },
    });

    await requestEstimate(ctx.me.organizationId);

    await ctx.prisma.blackoutTime.delete({
      where: { id: blackoutTime.id },
    });

    return blackoutTimeId;
  }
}

import { Arg, Resolver, Mutation, Int, UseMiddleware, Ctx } from "type-graphql";
import { Role, RoleStatus, RoleType } from "@generated/type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import {
  getScheduleStatus,
  requestEstimate,
} from "../../ticket/jobs/estimateTickets";
import { UserInputError } from "apollo-server-express";

@Resolver(Role)
export class DeleteRoleResolver {
  @Mutation((_returns) => Role)
  @UseMiddleware(hasRole([RoleType.OWNER, RoleType.ADMIN]))
  async deleteRole(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("roleId", () => Int!) roleId: number
  ): Promise<Role> {
    const role = await ctx.prisma.role.findFirstOrThrow({
      where: {
        id: roleId,
        organizationId: ctx.me.organizationId,
      },
    });

    if (role.type === RoleType.OWNER && ctx.me.roleType !== RoleType.OWNER) {
      throw new UserInputError("Only an owner can deactivate another owner");
    }

    if (role.id === ctx.me.roleId) {
      throw new UserInputError("You cannot deactivate yourself");
    }

    const updatedRole = await ctx.prisma.role.update({
      where: { id: role.id },
      data: { status: RoleStatus.DEACTIVATED },
    });

    // update organization schedule status in case deactivating that
    // person crashed the schedule
    await ctx.prisma.organization.update({
      where: {
        id: ctx.me.organizationId,
      },
      data: {
        scheduleStatus: await getScheduleStatus(ctx.me.organizationId),
      },
    });

    // and request a new estimate
    await requestEstimate(ctx.me.organizationId);

    return updatedRole;
  }
}

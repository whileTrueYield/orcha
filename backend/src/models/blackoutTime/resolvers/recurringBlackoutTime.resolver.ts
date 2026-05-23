import {
  Arg,
  Ctx,
  FieldResolver,
  Int,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import { RecurringBlackoutTime, Role } from "../../entities";
import { RoleType } from "@prisma/client";

@Resolver(RecurringBlackoutTime)
export class RecurringBlackoutTimeResolver {
  @Query((_returns) => RecurringBlackoutTime)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async recurringBlackoutTime(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("id", () => Int) id: number
  ): Promise<RecurringBlackoutTime> {
    return ctx.prisma.recurringBlackoutTime.findFirstOrThrow({
      where: {
        organizationId: ctx.me.organizationId,
        id,
      },
    });
  }

  @FieldResolver((_returns) => [Role])
  async roles(
    @Root() blackout: RecurringBlackoutTime,
    @Ctx() ctx: AppContext<AuthRoleContext>
  ): Promise<Role[]> {
    if (blackout.roles) {
      return blackout.roles;
    }

    return ctx.prisma.role.findMany({
      where: {
        recurringBlackoutTime: {
          some: { id: blackout.id },
        },
      },
    });
  }
}

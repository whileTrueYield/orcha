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
import { BlackoutTime, Role } from "../../entities";
import { RoleType } from "@prisma/client";

@Resolver(BlackoutTime)
export class BlackoutTimeResolver {
  @Query((_returns) => BlackoutTime)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async blackoutTime(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("id", () => Int) id: number
  ): Promise<BlackoutTime> {
    return ctx.prisma.blackoutTime.findFirstOrThrow({
      where: {
        organizationId: ctx.me.organizationId,
        id,
      },
    });
  }

  @FieldResolver((_returns) => [Role])
  async roles(
    @Root() blackout: BlackoutTime,
    @Ctx() ctx: AppContext<AuthRoleContext>
  ): Promise<Role[]> {
    if (blackout.roles) {
      return blackout.roles;
    }

    return ctx.prisma.role.findMany({
      where: {
        blackoutTime: {
          some: { id: blackout.id },
        },
      },
    });
  }
}

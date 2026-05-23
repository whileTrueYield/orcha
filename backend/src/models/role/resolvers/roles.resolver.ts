import { Arg, Query, Resolver, Int, UseMiddleware, Ctx } from "type-graphql";

import { Role } from "@generated/type-graphql";
import { hasRole, isAuthenticated } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import { PaginatedRoles } from "../entity";
import { getPaginatedRoles } from "../helper";
import { OrganizationStatus, RoleStatus } from "@prisma/client";

@Resolver(Role)
export class RolesResolver {
  @Query((_returns) => PaginatedRoles)
  @UseMiddleware(hasRole())
  async roles(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("first", () => Int, { nullable: true }) first: number,
    @Arg("last", () => Int, { nullable: true }) last: number,
    @Arg("offset", () => Int, { nullable: true }) offset: number,
    @Arg("sort", () => String, { nullable: true }) sort: keyof Role,
    @Arg("search", () => String, { nullable: true }) search: string
  ): Promise<PaginatedRoles> {
    return getPaginatedRoles({
      organizationId: ctx.me.organizationId,
      first,
      last,
      offset,
      sort,
      search,
    });
  }

  @Query((_returns) => [Role])
  @UseMiddleware(isAuthenticated)
  async myRoles(@Ctx() ctx: AppContext<AuthRoleContext>): Promise<Role[]> {
    return ctx.prisma.role.findMany({
      where: {
        userId: ctx.me.userId,
        status: { in: [RoleStatus.ACCEPTED, RoleStatus.INVITED] },
        organization: {
          status: OrganizationStatus.ACTIVE,
        },
      },
      include: {
        organization: true,
      },
      orderBy: {
        organization: {
          name: "asc",
        },
      },
    });
  }
}

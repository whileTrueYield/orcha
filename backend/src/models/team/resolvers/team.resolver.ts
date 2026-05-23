import {
  Arg,
  Query,
  Resolver,
  Int,
  FieldResolver,
  Root,
  Ctx,
  UseMiddleware,
  Mutation,
} from "type-graphql";
import {
  Team,
  Organization,
  Role,
  RoleType,
  RoleStatus,
} from "@generated/type-graphql";
import { PaginatedRoles } from "../../role/entity";
import { AuthRoleContext, AppContext } from "../../../types";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { map } from "lodash";
import { getPaginatedRoles } from "../../role/helper";

@Resolver(Team)
export class TeamResolver {
  @Query(() => Team)
  @UseMiddleware(hasRole())
  async team(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("id", () => Int) id: number
  ): Promise<Team> {
    return await ctx.prisma.team.findFirstOrThrow({
      where: {
        id,
        organizationId: ctx.me.organizationId,
      },
    });
  }

  @Mutation(() => Team)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async addMembers(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("teamId", () => Int) teamId: number,
    @Arg("roleIds", () => [Int]) roleIds: number[]
  ): Promise<Team> {
    const team = await ctx.prisma.team.findFirstOrThrow({
      where: {
        id: teamId,
        organizationId: ctx.me.organizationId,
      },
    });

    const validRoleIds = await ctx.prisma.role.findMany({
      select: { id: true },
      where: {
        organizationId: ctx.me.organizationId,
        status: { in: [RoleStatus.ACCEPTED, RoleStatus.INVITED] },
        id: { in: roleIds },
      },
    });

    return ctx.prisma.team.update({
      where: { id: team.id },
      data: {
        members: {
          connect: validRoleIds,
        },
      },
    });
  }

  @Mutation(() => Team)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async removeMembers(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("teamId", () => Int) teamId: number,
    @Arg("roleIds", () => [Int]) roleIds: number[]
  ): Promise<Team> {
    const team = await ctx.prisma.team.findFirstOrThrow({
      where: {
        id: teamId,
        organizationId: ctx.me.organizationId,
      },
    });

    return ctx.prisma.team.update({
      where: { id: team.id },
      data: {
        members: {
          disconnect: roleIds.map((id) => ({ id })),
        },
      },
    });
  }

  @FieldResolver((_returns) => Organization)
  async organization(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() team: Team
  ): Promise<Organization> {
    return ctx.prisma.organization.findUniqueOrThrow({
      where: { id: team.organizationId },
    });
  }

  /**
   * Return the complete role IDs set for a given team and only
   * their IDs.
   * @param team
   */
  @FieldResolver((_returns) => [Int])
  async memberIds(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() team: Team
  ): Promise<number[]> {
    const roleIds = await ctx.prisma.role.findMany({
      select: { id: true },
      where: {
        teams: {
          some: { id: team.id },
        },
      },
    });

    return map(roleIds, (row) => row.id);
  }

  @FieldResolver((_returns) => PaginatedRoles)
  async members(
    @Root() team: Team,
    @Arg("first", () => Int, { nullable: true }) first: number,
    @Arg("last", () => Int, { nullable: true }) last: number,
    @Arg("offset", () => Int, { nullable: true }) offset: number,
    @Arg("sort", () => String, { nullable: true }) sort: keyof Role,
    @Arg("search", () => String, { nullable: true }) search: string,
    @Ctx() ctx: AppContext<AuthRoleContext>
  ): Promise<PaginatedRoles> {
    return getPaginatedRoles({
      teamId: team.id,
      organizationId: ctx.me.organizationId,
      first,
      last,
      offset,
      sort,
      search,
    });
  }
}

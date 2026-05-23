import {
  Arg,
  Query,
  Resolver,
  Int,
  FieldResolver,
  Root,
  UseMiddleware,
  Ctx,
} from "type-graphql";
import { User, Role } from "@generated/type-graphql";
import { PaginatedRoles } from "../../../models/role/entity";
import { hasRole, isAuthenticated } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import { getPaginatedRoles } from "../../role/helper";
import { DEFAULT_USER_PREFERENCES, UserPreferences } from "../entity";
import { logger } from "../../../logger";

@Resolver(User)
export class UserResolver {
  @Query(() => User)
  async user(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("id", () => Int) id: number
  ): Promise<User> {
    return ctx.prisma.user.findUniqueOrThrow({
      where: { id },
    });
  }

  @FieldResolver((_returns) => PaginatedRoles)
  @UseMiddleware(isAuthenticated)
  async roles(
    @Root() user: User,
    @Arg("first", () => Int, { nullable: true }) first: number,
    @Arg("last", () => Int, { nullable: true }) last: number,
    @Arg("offset", () => Int, { nullable: true }) offset: number,
    @Arg("sort", () => String, { nullable: true }) sort: keyof Role
  ): Promise<PaginatedRoles> {
    return getPaginatedRoles({
      first,
      last,
      offset,
      sort,
      userId: user.id,
    });
  }

  @FieldResolver((_returns) => String)
  @UseMiddleware(isAuthenticated)
  async password(): Promise<string> {
    return "";
  }

  // Role of the user within the organization's context
  @FieldResolver((_returns) => Role)
  @UseMiddleware(hasRole())
  async role(
    @Root() user: User,
    @Ctx() ctx: AppContext<AuthRoleContext>
  ): Promise<Role> {
    return await ctx.prisma.role.findUniqueOrThrow({
      where: {
        organizationId_userId: {
          userId: user.id,
          organizationId: ctx.me.organizationId,
        },
      },
    });
  }

  @FieldResolver(() => UserPreferences)
  async preferences(@Root() user: User): Promise<UserPreferences> {
    try {
      if (user.preferences) {
        return { ...DEFAULT_USER_PREFERENCES, ...JSON.parse(user.preferences) };
      }
    } catch {
      logger.warn(
        `Could not parse preferences for user ${user.id}: ${user.preferences}`
      );
    }

    return DEFAULT_USER_PREFERENCES;
  }
}

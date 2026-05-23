import {
  Arg,
  Query,
  Resolver,
  Int,
  Ctx,
  UseMiddleware,
  FieldResolver,
  Root,
} from "type-graphql";
import { Organization, PersonalTag, Role } from "@generated/type-graphql";
import { AuthRoleContext, AppContext } from "../../../types";
import { hasRole } from "../../../middlewares/isAuthenticated";

@Resolver(PersonalTag)
export class PersonalTagResolver {
  @Query(() => PersonalTag)
  @UseMiddleware(hasRole())
  async personalTag(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("id", () => Int) id: number
  ): Promise<PersonalTag> {
    return await ctx.prisma.personalTag.findFirstOrThrow({
      where: {
        id,
        organizationId: ctx.me.organizationId,
        ownerId: ctx.me.roleId,
      },
    });
  }

  @FieldResolver((_returns) => Organization)
  async organization(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() tag: PersonalTag
  ): Promise<Organization> {
    if (tag.organization) {
      return tag.organization;
    }

    return ctx.prisma.organization.findUniqueOrThrow({
      where: { id: tag.organizationId },
    });
  }

  @FieldResolver((_returns) => Role)
  async owner(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() tag: PersonalTag
  ): Promise<Role> {
    if (tag.owner) {
      return tag.owner;
    }

    return ctx.prisma.role.findUniqueOrThrow({
      where: { id: tag.ownerId },
    });
  }
}

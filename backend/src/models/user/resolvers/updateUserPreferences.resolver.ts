import {
  Arg,
  Resolver,
  Mutation,
  InputType,
  Field,
  UseMiddleware,
  Ctx,
  Int,
} from "type-graphql";

import { Length } from "class-validator";
import { User } from "@generated/type-graphql";
import { isAuthenticated } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import { UserPreferences } from "../entity";

@InputType()
class UpdateUserPreferencesInput {
  @Field((_type) => [Int], { nullable: "items" })
  @Length(1, 128)
  favoriteOrganizations: number[];

  @Field((_type) => Int, { nullable: true })
  lastOrganizationId: number | null;
}

@Resolver(User)
export class UpdateUserPreferencesResolver {
  @Mutation(() => User)
  @UseMiddleware(isAuthenticated)
  async updateUserPreferences(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("input", () => UpdateUserPreferencesInput)
    input: UpdateUserPreferencesInput
  ): Promise<User> {
    const preferences: UserPreferences = {
      favoriteOrganizations: input.favoriteOrganizations,
      lastOrganizationId: input.lastOrganizationId,
    };

    return ctx.prisma.user.update({
      where: { id: ctx.me.roleId },
      data: { preferences: JSON.stringify(preferences) },
    });
  }
}

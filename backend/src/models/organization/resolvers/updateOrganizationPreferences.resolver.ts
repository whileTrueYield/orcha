import {
  Arg,
  Resolver,
  Mutation,
  InputType,
  Field,
  UseMiddleware,
  Ctx,
} from "type-graphql";

import { Organization, RoleType } from "@generated/type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import { OrganizationPreferences } from "../entity";

@InputType()
class UpdateOrganizationPreferencesInput {
  @Field((_type) => Boolean)
  showOnboarding: boolean;
}

@Resolver(Organization)
export class UpdateOrganizationPreferencesResolver {
  @Mutation(() => Organization)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async updateOrganizationPreferences(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("input", () => UpdateOrganizationPreferencesInput)
    input: UpdateOrganizationPreferencesInput
  ): Promise<Organization> {
    const preferences: OrganizationPreferences = {
      showOnboarding: input.showOnboarding,
    };

    return ctx.prisma.organization.update({
      where: { id: ctx.me.roleId },
      data: { preferences: JSON.stringify(preferences) },
    });
  }
}

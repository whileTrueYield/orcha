import {
  Arg,
  Resolver,
  Mutation,
  InputType,
  Field,
  Int,
  Ctx,
  UseMiddleware,
} from "type-graphql";

import { Length } from "class-validator";
import { PersonalTag, RoleType } from "@generated/type-graphql";
import { AppContext, AuthRoleContext } from "../../../types";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { UserInputError } from "apollo-server-express";
import { findPersonalTagByName } from "../helper";

@InputType()
class UpdatePersonalTagInput {
  @Field({ nullable: true })
  @Length(1, 128)
  name: string;
}

@Resolver(PersonalTag)
export class UpdatePersonalTagResolver {
  @Mutation(() => PersonalTag)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async updatePersonalTag(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("tagId", () => Int) tagId: number,
    @Arg("input", () => UpdatePersonalTagInput) input: UpdatePersonalTagInput
  ): Promise<PersonalTag> {
    const personalTag = await ctx.prisma.personalTag.findFirstOrThrow({
      where: {
        organizationId: ctx.me.organizationId,
        ownerId: ctx.me.roleId,
        id: tagId,
      },
    });

    // When the personalTag name is changed we don't want to take an
    // existing one
    if (input.name && input.name !== personalTag.name) {
      const existingPersonalTag = await findPersonalTagByName(
        input.name,
        ctx.me.organizationId,
        ctx.me.roleId
      );

      if (existingPersonalTag && existingPersonalTag.id !== personalTag.id) {
        throw new UserInputError("A tag with the same name already exists");
      }
    }

    return ctx.prisma.personalTag.update({
      where: { id: personalTag.id },
      data: input,
    });
  }
}

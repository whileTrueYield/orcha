import {
  Arg,
  Resolver,
  Mutation,
  InputType,
  Field,
  UseMiddleware,
  Ctx,
} from "type-graphql";

import { Length } from "class-validator";
import { PersonalTag, RoleType } from "@generated/type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import { UserInputError } from "apollo-server-express";
import { findPersonalTagByName } from "../helper";

@InputType()
export class CreatePersonalTagInput {
  @Field()
  @Length(1, 128)
  name: string;
}

@Resolver(PersonalTag)
export class CreatePersonalTagResolver {
  @Mutation(() => PersonalTag)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async createPersonalTag(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("input")
    input: CreatePersonalTagInput
  ): Promise<PersonalTag> {
    const tagUsingSameName = await findPersonalTagByName(
      input.name,
      ctx.me.organizationId,
      ctx.me.roleId
    );

    if (tagUsingSameName) {
      throw new UserInputError("A tag with the same name already exists");
    }

    return ctx.prisma.personalTag.create({
      data: {
        ...input,
        organizationId: ctx.me.organizationId,
        ownerId: ctx.me.roleId,
      },
    });
  }
}

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
import { Tag, RoleType } from "@generated/type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import { UserInputError } from "apollo-server-express";
import { findTagByName } from "../helper";

@InputType()
export class CreateTagInput {
  @Field()
  @Length(1, 128)
  name: string;

  @Field()
  @Length(1, 128)
  color: string;
}

@Resolver(Tag)
export class CreateTagResolver {
  @Mutation(() => Tag)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async createTag(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("input")
    input: CreateTagInput
  ): Promise<Tag> {
    const tagUsingSameName = await findTagByName(
      input.name,
      ctx.me.organizationId
    );

    if (tagUsingSameName) {
      throw new UserInputError("A tag with the same name already exists");
    }

    return ctx.prisma.tag.create({
      data: {
        ...input,
        organizationId: ctx.me.organizationId,
        authorId: ctx.me.roleId,
      },
    });
  }
}

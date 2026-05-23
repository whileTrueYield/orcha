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
import { Tag, RoleType } from "@generated/type-graphql";
import { AppContext, AuthRoleContext } from "../../../types";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { UserInputError } from "apollo-server-express";
import { findTagByName } from "../helper";

@InputType()
class UpdateTagInput {
  @Field({ nullable: true })
  @Length(1, 128)
  name: string;

  @Field()
  @Length(1, 128)
  color: string;
}

@Resolver(Tag)
export class UpdateTagResolver {
  @Mutation(() => Tag)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async updateTag(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("tagId", () => Int) tagId: number,
    @Arg("input", () => UpdateTagInput) input: UpdateTagInput
  ): Promise<Tag> {
    const tag = await ctx.prisma.tag.findFirstOrThrow({
      where: {
        organizationId: ctx.me.organizationId,
        id: tagId,
      },
    });

    // When the tag name is changed we don't want to take an
    // existing one
    if (input.name && input.name !== tag.name) {
      const existingTag = await findTagByName(
        input.name,
        ctx.me.organizationId
      );

      if (existingTag && existingTag.id !== tag.id) {
        throw new UserInputError("A tag with the same name already exists");
      }
    }

    return ctx.prisma.tag.update({ where: { id: tag.id }, data: input });
  }
}

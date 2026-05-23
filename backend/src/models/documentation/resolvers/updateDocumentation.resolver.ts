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

import { IsUrl, Length, MaxLength } from "class-validator";
import { Documentation, RoleType, ModelStage } from "@generated/type-graphql";
import { AppContext, AuthRoleContext } from "../../../types";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { UserInputError } from "apollo-server-express";
import { ModelStage as DbModelStage } from "@prisma/client";
import { isAdminLevel } from "../../../utils/rbac";

@InputType()
class UpdateDocumentationInput {
  @Field({ nullable: true })
  @Length(1, 128)
  name: string;

  @Field(() => String, { nullable: true })
  @MaxLength(2048)
  description?: string | null;

  @Field(() => String, { nullable: true })
  @MaxLength(2048)
  @IsUrl()
  coverUrl?: string | null;
}

@Resolver(Documentation)
export class UpdateDocumentationResolver {
  @Mutation(() => Documentation)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async updateDocumentationStage(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("documentationId", () => Int) documentationId: number,
    @Arg("stage", () => ModelStage) stage: ModelStage
  ): Promise<Documentation> {
    const documentation = await ctx.prisma.documentation.findFirstOrThrow({
      where: {
        id: documentationId,
        organizationId: ctx.me.organizationId,
      },
    });

    // we can come back to draft at any point
    const allowedTransitions: { [key: string]: DbModelStage[] } = {
      [ModelStage.DRAFT]: [
        DbModelStage.DELETED,
        DbModelStage.PUBLISHED,
        DbModelStage.ARCHIVED,
      ],
      [ModelStage.ARCHIVED]: [
        DbModelStage.DELETED,
        DbModelStage.PUBLISHED,
        DbModelStage.DRAFT,
      ],
      [ModelStage.PUBLISHED]: [
        DbModelStage.DELETED,
        DbModelStage.ARCHIVED,
        DbModelStage.DRAFT,
      ],
    };

    if (stage === DbModelStage.DELETED && !isAdminLevel(ctx.me.roleType)) {
      throw new UserInputError("Only admins can delete a documentation");
    }

    if (
      stage in allowedTransitions &&
      allowedTransitions[stage].indexOf(documentation.stage)
    ) {
      return ctx.prisma.documentation.update({
        where: { id: documentation.id },
        data: { stage },
      });
    }

    throw new UserInputError(
      `Cannot go from ${documentation.stage} to ${stage}`
    );
  }

  @Mutation(() => Documentation)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async updateDocumentation(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("documentationId", () => Int) documentationId: number,
    @Arg("input", () => UpdateDocumentationInput)
    input: UpdateDocumentationInput
  ): Promise<Documentation> {
    const documentation = await ctx.prisma.documentation.findFirstOrThrow({
      where: {
        organizationId: ctx.me.organizationId,
        id: documentationId,
      },
    });

    return ctx.prisma.documentation.update({
      where: { id: documentation.id },
      data: input,
    });
  }
}

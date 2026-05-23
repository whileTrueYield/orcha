import {
  Arg,
  Resolver,
  Mutation,
  InputType,
  Field,
  UseMiddleware,
  Ctx,
} from "type-graphql";

import { Length, MaxLength } from "class-validator";
import { Documentation } from "@generated/type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import { ModelStage } from "@prisma/client";
import { FeatureFlags, hasFeature } from "../../../middlewares/featureFlag";

@InputType()
class CreateDocumentationInput {
  @Field()
  @Length(1, 128)
  name: string;

  @Field(() => String, { nullable: true })
  @MaxLength(2048)
  description?: string | null;
}

@Resolver(Documentation)
export class CreateDocumentationResolver {
  @Mutation(() => Documentation)
  @UseMiddleware(hasRole())
  @UseMiddleware(hasFeature(FeatureFlags.DOCUMENTATION))
  async createDocumentation(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("input")
    input: CreateDocumentationInput
  ): Promise<Documentation> {
    const documentation = await ctx.prisma.documentation.create({
      data: {
        ...input,
        organizationId: ctx.me.organizationId,
        stage: ModelStage.DRAFT,
      },
    });

    await ctx.prisma.documentationPage.create({
      data: {
        documentation: { connect: { id: documentation.id } },
        organization: { connect: { id: ctx.me.organizationId } },
        position: 1,
        title: "first page",
        body: "# My first page\n\n This is your first documentation page",
      },
    });

    return documentation;
  }
}

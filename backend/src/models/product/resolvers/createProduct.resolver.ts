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
import { Product, RoleType } from "@generated/type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import { UserInputError } from "apollo-server-express";
import { findProductByCode } from "../helper";
import { ModelStage } from "@prisma/client";

@InputType()
class CreateProductInput {
  @Field()
  @Length(1, 128)
  name: string;

  @Field()
  @Length(1, 128)
  code: string;

  @Field({ nullable: true })
  @MaxLength(2048)
  description: string;
}

@Resolver(Product)
export class CreateProductResolver {
  @Mutation(() => Product)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async createProduct(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("input")
    input: CreateProductInput
  ): Promise<Product> {
    const productUsingSameCode = await findProductByCode(
      input.code,
      ctx.me.organizationId
    );

    if (productUsingSameCode) {
      throw new UserInputError("A product with the same code already exists");
    }

    return ctx.prisma.product.create({
      data: {
        ...input,
        organizationId: ctx.me.organizationId,
        stage: ModelStage.PUBLISHED,
      },
    });
  }
}

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

import { Length, MaxLength, IsUrl } from "class-validator";
import { Product, RoleType, ModelStage } from "@generated/type-graphql";
import { AppContext, AuthRoleContext } from "../../../types";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { UserInputError } from "apollo-server-express";
import { findProductByCode } from "../helper";
import { ModelStage as DbModelStage } from "@prisma/client";

@InputType()
class UpdateProductInput {
  @Field({ nullable: true })
  @Length(1, 128)
  name: string;

  @Field({ nullable: true })
  @Length(1, 128)
  code: string;

  @Field(() => String, { nullable: true })
  @MaxLength(2048)
  description?: string | null;

  @Field(() => String, { nullable: true })
  @MaxLength(2048)
  @IsUrl()
  coverUrl?: string | null;

  @Field(() => Boolean, { nullable: true })
  isSupportActive?: boolean;
}

@Resolver(Product)
export class UpdateProductResolver {
  @Mutation(() => Product)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async updateProductStage(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("productId", () => Int) productId: number,
    @Arg("stage", () => ModelStage) stage: ModelStage
  ): Promise<Product> {
    const product = await ctx.prisma.product.findFirstOrThrow({
      where: {
        id: productId,
        organizationId: ctx.me.organizationId,
        stage: { not: ModelStage.DELETED },
      },
    });

    const allowedTransitions: { [key: string]: DbModelStage[] } = {
      [ModelStage.DRAFT]: [DbModelStage.DELETED, DbModelStage.PUBLISHED],
      [ModelStage.ARCHIVED]: [DbModelStage.DELETED, DbModelStage.PUBLISHED],
      [ModelStage.PUBLISHED]: [DbModelStage.DELETED, DbModelStage.ARCHIVED],
    };

    if (
      stage in allowedTransitions &&
      allowedTransitions[stage].indexOf(product.stage)
    ) {
      return ctx.prisma.product.update({
        where: { id: product.id },
        data: { stage },
      });
    }

    throw new UserInputError(`Cannot go from ${product.stage} to ${stage}`);
  }

  @Mutation(() => Product)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async updateProductUseGlobalWorkflow(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("productId", () => Int) productId: number,
    @Arg("useDefaultWorkflows", () => Boolean)
    useDefaultWorkflows: boolean
  ): Promise<Product> {
    const product = await ctx.prisma.product.findFirstOrThrow({
      where: {
        id: productId,
        organizationId: ctx.me.organizationId,
        stage: { not: ModelStage.DELETED },
      },
    });

    if (product.stage === ModelStage.ARCHIVED) {
      new UserInputError("Cannot edit an archived product");
    }

    return ctx.prisma.product.update({
      where: { id: product.id },
      data: { isUsingDefaultWorkflows: useDefaultWorkflows },
    });
  }

  @Mutation(() => Product)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async updateProduct(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("productId", () => Int) productId: number,
    @Arg("input", () => UpdateProductInput) input: UpdateProductInput
  ): Promise<Product> {
    const product = await ctx.prisma.product.findFirstOrThrow({
      where: {
        organizationId: ctx.me.organizationId,
        id: productId,
        stage: { not: ModelStage.DELETED },
      },
    });

    if (product.stage === ModelStage.ARCHIVED) {
      new UserInputError("Cannot edit an archived product");
    }

    // When the code is changed we don't want to take an
    // existing one
    if (input.code && input.code !== product.code) {
      const existingProduct = await findProductByCode(
        input.code,
        ctx.me.organizationId
      );

      if (existingProduct && existingProduct.id !== product.id) {
        throw new UserInputError("A product with the same code already exists");
      }
    }

    return ctx.prisma.product.update({
      where: { id: product.id },
      data: input,
    });
  }
}

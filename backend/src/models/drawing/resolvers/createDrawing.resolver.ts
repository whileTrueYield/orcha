import {
  Arg,
  Resolver,
  Mutation,
  InputType,
  Field,
  UseMiddleware,
  Ctx,
} from "type-graphql";

import { Drawing } from "@generated/type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";

@InputType()
class CreateDrawingInput {
  @Field({ nullable: true })
  data: string;
}

@Resolver(Drawing)
export class CreateDrawingResolver {
  @Mutation(() => Drawing)
  @UseMiddleware(hasRole())
  async createDrawing(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("input")
    input: CreateDrawingInput
  ): Promise<Drawing> {
    return ctx.prisma.drawing.create({
      data: {
        ...input,
        organizationId: ctx.me.organizationId,
      },
    });
  }
}

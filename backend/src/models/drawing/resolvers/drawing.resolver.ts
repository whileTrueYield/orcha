import {
  Arg,
  Query,
  Resolver,
  Int,
  FieldResolver,
  Root,
  Ctx,
  UseMiddleware,
} from "type-graphql";
import { Drawing, Organization } from "@generated/type-graphql";
import { AuthRoleContext, AppContext } from "../../../types";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { UserInputError } from "apollo-server-express";

@Resolver(Drawing)
export class DrawingResolver {
  @Query(() => Drawing!)
  @UseMiddleware(hasRole())
  async drawing(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("id", () => Int) id: number
  ): Promise<Drawing> {
    const drawing = await ctx.prisma.drawing.findFirst({
      where: {
        id,
        organizationId: ctx.me.organizationId,
      },
    });

    if (!drawing) {
      throw new UserInputError(
        "This drawing does not exist or has been deleted"
      );
    }

    return drawing;
  }

  @FieldResolver((_returns) => Organization)
  async organization(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() drawing: Drawing
  ): Promise<Organization> {
    if (drawing.organization) {
      return drawing.organization;
    }

    return ctx.prisma.organization.findUniqueOrThrow({
      where: { id: drawing.organizationId },
    });
  }
}

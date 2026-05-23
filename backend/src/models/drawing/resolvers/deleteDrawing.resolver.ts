import { Arg, Resolver, Mutation, Int, UseMiddleware, Ctx } from "type-graphql";

import { Drawing } from "@generated/type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";

@Resolver(Drawing)
export class DeleteDrawingResolver {
  @Mutation((_returns) => Drawing)
  @UseMiddleware(hasRole([]))
  async deleteDrawing(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("drawingId", () => Int!) drawingId: number
  ): Promise<Drawing> {
    const drawing = await ctx.prisma.drawing.findFirstOrThrow({
      where: {
        id: drawingId,
        organizationId: ctx.me.organizationId,
      },
    });

    return ctx.prisma.drawing.delete({ where: { id: drawing.id } });
  }
}

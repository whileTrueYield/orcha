import { Query, Resolver, UseMiddleware, Ctx } from "type-graphql";
import { MiniTag } from "../entity";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";

@Resolver(MiniTag)
export class MiniTagResolver {
  @Query((_returns) => [MiniTag])
  @UseMiddleware(hasRole())
  async miniTags(@Ctx() ctx: AppContext<AuthRoleContext>): Promise<MiniTag[]> {
    return ctx.prisma.tag.findMany({
      where: {
        organizationId: ctx.me.organizationId,
      },
      select: {
        id: true,
        name: true,
        color: true,
      },
    });
  }
}

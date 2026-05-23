import { Query, Resolver, UseMiddleware, Ctx } from "type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import { getMyNextTickets } from "../helper";
import { NextTicket } from "../entity";

@Resolver((_of) => NextTicket)
export class NextTicketResolver {
  @Query((_returns) => [NextTicket])
  @UseMiddleware(hasRole())
  async myNextTickets(
    @Ctx() ctx: AppContext<AuthRoleContext>
  ): Promise<NextTicket[]> {
    return getMyNextTickets({
      roleId: ctx.me.roleId,
      organizationId: ctx.me.organizationId,
    });
  }
}

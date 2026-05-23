import { Query, Resolver, UseMiddleware, Ctx } from "type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import { getMyUpcomingTickets } from "../helper";
import { MyUpcomingAssignedTicket } from "../entity";

@Resolver((_of) => MyUpcomingAssignedTicket)
export class UpcomingTicketResolver {
  @Query((_returns) => [MyUpcomingAssignedTicket], {
    description:
      "tickets we will be working on, once the current assignee is done",
  })
  @UseMiddleware(hasRole())
  async myUpcomingTickets(
    @Ctx() ctx: AppContext<AuthRoleContext>
  ): Promise<MyUpcomingAssignedTicket[]> {
    return getMyUpcomingTickets({
      roleId: ctx.me.roleId,
      organizationId: ctx.me.organizationId,
    });
  }
}

/**
 * Query resolver for tickets the current user will work on
 * once the current assignee finishes their step.
 *
 * Registers: Query.myUpcomingTickets: [MyUpcomingAssignedTicket!]!
 *
 * Delegates to the getMyUpcomingTickets helper.
 */

import builder from "../../../schema/builder";
import { MyUpcomingAssignedTicketRef } from "../entity";
import { getMyUpcomingTickets } from "../helper";
import { AuthRoleContext } from "../../../types";

// ---------------------------------------------------------------------------
// Query: myUpcomingTickets
// ---------------------------------------------------------------------------

builder.queryField("myUpcomingTickets", (t) =>
  t.field({
    type: [MyUpcomingAssignedTicketRef],
    authScopes: { hasRole: true },
    resolve: (_root, _args, ctx) => {
      const me = ctx.me as AuthRoleContext;
      return getMyUpcomingTickets({
        roleId: me.roleId,
        organizationId: me.organizationId,
      });
    },
  }),
);

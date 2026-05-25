/**
 * Query resolver for the current user's next assigned tickets.
 *
 * Registers: Query.myNextTickets: [NextTicket!]!
 *
 * Delegates to the getMyNextTickets helper which finds tickets
 * the current user is scheduled to work on based on estimate epochs.
 */

import builder from "../../../schema/builder";
import { NextTicketRef } from "../entity";
import { getMyNextTickets } from "../helper";
import { AuthRoleContext } from "../../../types";

// ---------------------------------------------------------------------------
// Query: myNextTickets
// ---------------------------------------------------------------------------

builder.queryField("myNextTickets", (t) =>
  t.field({
    type: [NextTicketRef],
    authScopes: { hasRole: true },
    resolve: (_root, _args, ctx) => {
      const me = ctx.me as AuthRoleContext;
      return getMyNextTickets({
        roleId: me.roleId,
        organizationId: me.organizationId,
      });
    },
  }),
);

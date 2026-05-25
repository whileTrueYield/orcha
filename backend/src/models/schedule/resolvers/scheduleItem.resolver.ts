/**
 * ScheduleItem queries — single item, active items, and last item.
 *
 * Registers:
 *  - Query.scheduleItem(scheduleItemId): ScheduleItem
 *  - Query.activeScheduleItems: [ScheduleItem]
 *  - Query.lastScheduleItem: ScheduleItem
 *
 * The ScheduleItem relation fields (ticket, organization, role,
 * ticketWorkflowState, nextTicketWorkflowState) are already defined
 * on the prismaObject in entity.ts via t.relation().
 *
 * Auth: hasRole (any linked user).
 */

import builder from "../../../schema/builder";
import { AuthRoleContext } from "../../../types";

// ---------------------------------------------------------------------------
// Query: scheduleItem
// ---------------------------------------------------------------------------

builder.queryField("scheduleItem", (t) =>
  t.prismaField({
    type: "ScheduleItem",
    authScopes: { hasRole: true },
    args: {
      scheduleItemId: t.arg.int({ required: true }),
    },
    resolve: (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      return ctx.prisma.scheduleItem.findFirstOrThrow({
        ...query,
        where: {
          id: args.scheduleItemId,
          organizationId: me.organizationId,
          roleId: me.roleId,
        },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Query: activeScheduleItems
// ---------------------------------------------------------------------------

builder.queryField("activeScheduleItems", (t) =>
  t.prismaField({
    type: ["ScheduleItem"],
    authScopes: { hasRole: true },
    resolve: (query, _root, _args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      return ctx.prisma.scheduleItem.findMany({
        ...query,
        where: {
          organizationId: me.organizationId,
          roleId: me.roleId,
          stoppedAt: null,
        },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Query: lastScheduleItem — most recent item for the current user
// ---------------------------------------------------------------------------

builder.queryField("lastScheduleItem", (t) =>
  t.prismaField({
    type: "ScheduleItem",
    authScopes: { hasRole: true },
    resolve: (query, _root, _args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      return ctx.prisma.scheduleItem.findFirstOrThrow({
        ...query,
        where: {
          organizationId: me.organizationId,
          roleId: me.roleId,
        },
        orderBy: {
          startedAt: "desc",
        },
      });
    },
  }),
);

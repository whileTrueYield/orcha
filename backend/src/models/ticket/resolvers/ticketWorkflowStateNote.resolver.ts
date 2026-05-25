/**
 * Query resolver for TicketWorkflowStateNote.
 *
 * Registers: Query.ticketWorkflowStateNote(ticketWorkflowStateNoteId): TicketWorkflowStateNote!
 *
 * The field resolvers (ticketWorkflowState, fromTicketWorkflowState, author)
 * are handled by Pothos relations defined on the prismaObject in entity.ts.
 */

import builder from "../../../schema/builder";
import { AuthRoleContext } from "../../../types";

// ---------------------------------------------------------------------------
// Query: ticketWorkflowStateNote
// ---------------------------------------------------------------------------

builder.queryField("ticketWorkflowStateNote", (t) =>
  t.prismaField({
    type: "TicketWorkflowStateNote",
    authScopes: { hasRole: true },
    args: {
      ticketWorkflowStateNoteId: t.arg.int({ required: true }),
    },
    resolve: (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;
      return ctx.prisma.ticketWorkflowStateNote.findFirstOrThrow({
        ...query,
        where: {
          id: args.ticketWorkflowStateNoteId,
          ticketWorkflowState: {
            ticket: {
              organizationId: me.organizationId,
            },
          },
        },
        include: {
          ...query.include,
          author: true,
          ticketWorkflowState: true,
          fromTicketWorkflowState: true,
        },
      });
    },
  }),
);

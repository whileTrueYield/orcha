/**
 * Query: workflowState — single workflow state by ID.
 */

import builder from "../../../schema/builder";
import { AuthRoleContext } from "../../../types";

builder.queryField("workflowState", (t) =>
  t.prismaField({
    type: "WorkflowState",
    authScopes: { hasRole: true },
    args: {
      id: t.arg.int({ required: true }),
    },
    resolve: (query, _root, args, ctx) =>
      ctx.prisma.workflowState.findFirstOrThrow({
        ...query,
        where: {
          id: args.id,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
        },
      }),
  }),
);

/**
 * Query: projectAnalytics — ticket count breakdown per project.
 *
 * Field resolvers compute the actual counts lazily.
 */

import builder from "../../../schema/builder";
import { ProjectAnalyticsRef } from "../entity";
import { AuthRoleContext } from "../../../types";

builder.queryField("projectAnalytics", (t) =>
  t.field({
    type: ProjectAnalyticsRef,
    nullable: true,
    authScopes: { hasRole: true },
    args: {
      projectId: t.arg.int({ required: true }),
    },
    resolve: (_root, args, ctx) => ({
      projectId: args.projectId,
      organizationId: (ctx.me as AuthRoleContext).organizationId,
      scheduledTicketCount: 0,
      draftTicketCount: 0,
      inProgressTicketCount: 0,
      doneTicketCount: 0,
      unassignedTicketCount: 0,
      estimatedTicketCount: 0,
      unestimatedTicketCount: 0,
    }),
  }),
);

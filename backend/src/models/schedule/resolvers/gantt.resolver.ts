/**
 * Query: getGanttProjects — projects with their scheduled tickets for the Gantt view.
 *
 * Registers: Query.getGanttProjects: [Project]
 *
 * Auth: hasRole (any linked user).
 */

import builder from "../../../schema/builder";
import { TicketStatus, ModelStage } from "@prisma/client";
import { AuthRoleContext } from "../../../types";

builder.queryField("getGanttProjects", (t) =>
  t.prismaField({
    type: ["Project"],
    authScopes: { hasRole: true },
    resolve: (query, _root, _args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      return ctx.prisma.project.findMany({
        ...query,
        where: {
          organizationId: me.organizationId,
          stage: ModelStage.PUBLISHED,
          ancestorIsArchived: false,
        },
        include: {
          tickets: {
            where: {
              status: TicketStatus.SCHEDULED,
              stage: ModelStage.PUBLISHED,
            },
            include: {
              product: true,
              ticketWorkflowStates: {
                where: {
                  isActive: true,
                },
                orderBy: { position: "asc" },
              },
            },
          },
        },
        orderBy: { name: "asc" },
      });
    },
  }),
);

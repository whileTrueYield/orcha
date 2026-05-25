/**
 * Query resolver for ticket and project dependency graphs.
 *
 * Registers: Query.dependencies(projectId?): DependencySet!
 *
 * Returns a DependencySet containing all tickets and projects
 * with their ancestor/successor relationships, optionally filtered
 * to a specific project subtree.
 */

import { ModelStage, Prisma, TicketStatus } from "@prisma/client";
import builder from "../../../schema/builder";
import { DependencySetRef } from "../entity";
import { AuthRoleContext } from "../../../types";
import { getProjectDescendantIds } from "../../project/helper";

// ---------------------------------------------------------------------------
// Query: dependencies
// ---------------------------------------------------------------------------

builder.queryField("dependencies", (t) =>
  t.field({
    type: DependencySetRef,
    authScopes: { hasRole: true },
    args: {
      projectId: t.arg.int({ required: false }),
    },
    resolve: async (_root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      const ticketWhere: Prisma.TicketWhereInput = {
        organizationId: me.organizationId,
        stage: ModelStage.PUBLISHED,
        status: { in: [TicketStatus.SCHEDULED, TicketStatus.UNSCHEDULED] },
      };

      const projectWhere: Prisma.ProjectWhereInput = {
        organizationId: me.organizationId,
      };

      if (args.projectId) {
        const projectIds = [
          args.projectId,
          ...(await getProjectDescendantIds(args.projectId)),
        ];
        ticketWhere.projectId = { in: projectIds };
        projectWhere.id = { in: projectIds };
      }

      const tickets = await ctx.prisma.ticket.findMany({
        where: { ...ticketWhere },
        include: {
          ancestors: {
            select: { id: true },
            where: { stage: ModelStage.PUBLISHED },
          },
          successors: {
            select: { id: true },
            where: { stage: ModelStage.PUBLISHED },
          },
          product: true,
        },
        orderBy: { id: "asc" },
      });

      const projects = await ctx.prisma.project.findMany({
        where: projectWhere,
      });

      return {
        tickets: tickets.map((t) => ({
          id: t.id,
          localId: t.localId,
          productCode: t.product?.code,
          title: t.title,
          projectId: t.projectId,
          status: t.status,
          successors: t.successors.map(({ id }) => id),
          ancestors: t.ancestors.map(({ id }) => id),
          milestone: t.milestone,
        })),
        projects: projects.map((project) => ({
          id: project.id,
          name: project.name,
          parentId: project.parentId,
          // in case we start having project dependencies (which we should!)
          successors: [],
          ancestors: [],
        })),
      };
    },
  }),
);

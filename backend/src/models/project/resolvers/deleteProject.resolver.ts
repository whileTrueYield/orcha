/**
 * Mutations: deleteProject, archiveProject, unarchiveProject.
 */

import builder from "../../../schema/builder";
import { ModelStage, TicketStatus } from "@prisma/client";
import { GraphQLError } from "graphql";
import { getProjectDescendantIds } from "../helper";
import prisma from "../../../prisma";
import { AuthRoleContext } from "../../../types";

builder.mutationField("deleteProject", (t) =>
  t.boolean({
    authScopes: { hasRole: true },
    args: {
      projectId: t.arg.int({ required: true }),
    },
    resolve: async (_root, args, ctx) => {
      const project = await ctx.prisma.project.findFirstOrThrow({
        where: {
          organizationId: (ctx.me as AuthRoleContext).organizationId,
          id: args.projectId,
          stage: { in: [ModelStage.PUBLISHED, ModelStage.DRAFT, ModelStage.ARCHIVED] },
        },
      });

      const subProjects = await ctx.prisma.project.count({
        where: { organizationId: (ctx.me as AuthRoleContext).organizationId, parentId: project.id },
      });

      if (subProjects) {
        throw new GraphQLError("Cannot delete a project with sub-projects", { extensions: { code: "BAD_USER_INPUT" } });
      }

      const subTickets = await ctx.prisma.ticket.count({
        where: { organizationId: (ctx.me as AuthRoleContext).organizationId, projectId: project.id },
      });

      if (subTickets) {
        throw new GraphQLError("Cannot delete a project containing tickets", { extensions: { code: "BAD_USER_INPUT" } });
      }

      await ctx.prisma.project.delete({ where: { id: project.id } });
      return true;
    },
  }),
);

builder.mutationField("archiveProject", (t) =>
  t.prismaField({
    type: "Project",
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      projectId: t.arg.int({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const project = await ctx.prisma.project.findFirstOrThrow({
        where: {
          id: args.projectId,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
          stage: { in: [ModelStage.PUBLISHED, ModelStage.DRAFT] },
        },
      });

      const projectIds = await getProjectDescendantIds(project.id);

      const scheduleTickets = await prisma.ticket.count({
        where: {
          organizationId: (ctx.me as AuthRoleContext).organizationId,
          stage: ModelStage.PUBLISHED,
          status: TicketStatus.SCHEDULED,
          projectId: { in: [...projectIds, project.id] },
        },
      });

      if (scheduleTickets > 0) {
        throw new GraphQLError(
          "Project contains scheduled tickets, unschedule tickets first.",
          { extensions: { code: "BAD_USER_INPUT" } },
        );
      }

      return ctx.prisma.project.update({
        ...query,
        where: { id: project.id },
        data: { stage: ModelStage.ARCHIVED },
      });
    },
  }),
);

builder.mutationField("unarchiveProject", (t) =>
  t.prismaField({
    type: "Project",
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      projectId: t.arg.int({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const project = await ctx.prisma.project.findFirstOrThrow({
        where: {
          id: args.projectId,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
          stage: ModelStage.ARCHIVED,
        },
      });

      return ctx.prisma.project.update({
        ...query,
        where: { id: project.id },
        data: { stage: ModelStage.PUBLISHED },
      });
    },
  }),
);

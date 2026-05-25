/**
 * Project update mutations: updateProjectName (deprecated), moveProjectToRoot,
 * moveIntoProject, renameProject, publishProject, updateProjectOwner.
 */

import builder from "../../../schema/builder";
import { ModelStage, RoleStatus } from "@prisma/client";
import { getProjectDescendantIds, renameProject } from "../helper";
import { map } from "lodash";
import { GraphQLError } from "graphql";
import { AuthRoleContext } from "../../../types";

builder.mutationField("updateProjectName", (t) =>
  t.prismaField({
    type: "Project",
    deprecationReason: "Use renameProject instead",
    authScopes: { hasRole: true },
    args: {
      projectId: t.arg.int({ required: true }),
      name: t.arg.string({ required: true }),
    },
    resolve: async (_query, _root, args, ctx) => {
      const project = await ctx.prisma.project.findFirstOrThrow({
        where: { organizationId: (ctx.me as AuthRoleContext).organizationId, id: args.projectId },
      });
      return renameProject(project, args.name);
    },
  }),
);

builder.mutationField("moveProjectToRoot", (t) =>
  t.prismaField({
    type: "Project",
    authScopes: { hasRole: true },
    args: { projectId: t.arg.int({ required: true }) },
    resolve: async (query, _root, args, ctx) => {
      const project = await ctx.prisma.project.findFirstOrThrow({
        where: { organizationId: (ctx.me as AuthRoleContext).organizationId, id: args.projectId },
      });
      return ctx.prisma.project.update({ ...query, where: { id: project.id }, data: { parentId: null } });
    },
  }),
);

builder.mutationField("moveIntoProject", (t) =>
  t.boolean({
    authScopes: { hasRole: true },
    args: {
      sources: t.arg.stringList({ required: true }),
      projectId: t.arg.int({ required: true }),
    },
    resolve: async (_root, args, ctx) => {
      const ticketIds: number[] = [];
      const projectIds: number[] = [];

      const project = await ctx.prisma.project.findFirstOrThrow({
        where: { organizationId: (ctx.me as AuthRoleContext).organizationId, id: args.projectId, stage: { not: ModelStage.DELETED } },
      });

      if (project.stage === ModelStage.ARCHIVED || project.ancestorIsArchived) {
        throw new GraphQLError("Cannot move a project or ticket inside an archived project", { extensions: { code: "BAD_USER_INPUT" } });
      }
      if (project.stage === ModelStage.DRAFT) {
        throw new GraphQLError("Cannot move a project or ticket inside a draft project", { extensions: { code: "BAD_USER_INPUT" } });
      }
      if (project.stage !== ModelStage.PUBLISHED) {
        throw new GraphQLError("Cannot move a project or ticket inside an unpublished project", { extensions: { code: "BAD_USER_INPUT" } });
      }

      for (const source of args.sources) {
        const [sourceType, sourceId] = source.split(":");
        switch (sourceType) {
          case "ticket": ticketIds.push(parseInt(sourceId, 10)); break;
          case "project": projectIds.push(parseInt(sourceId, 10)); break;
        }
      }

      const reservedNames = await ctx.prisma.project
        .findMany({ select: { name: true }, where: { parentId: args.projectId } })
        .then((v) => map(v, "name"));

      for (const id of projectIds) {
        if (id === args.projectId) throw new Error("Cannot move a project into itself");
        const childrenIds = await getProjectDescendantIds(id);
        if (childrenIds.indexOf(args.projectId) > -1) throw new Error("Cannot move a project into one of its children");
        const conflictingName = await ctx.prisma.project.findFirst({
          select: { name: true },
          where: { id, name: { in: reservedNames, mode: "insensitive" } },
        });
        if (conflictingName) throw new GraphQLError(`Cannot move project: ${conflictingName.name} already exists at this location`, { extensions: { code: "BAD_USER_INPUT" } });
      }

      await ctx.prisma.ticket.updateMany({
        where: { organizationId: (ctx.me as AuthRoleContext).organizationId, id: { in: ticketIds } },
        data: { projectId: project.id },
      });
      await ctx.prisma.project.updateMany({
        where: { organizationId: (ctx.me as AuthRoleContext).organizationId, id: { in: projectIds } },
        data: { parentId: project.id },
      });

      return true;
    },
  }),
);

builder.mutationField("renameProject", (t) =>
  t.prismaField({
    type: "Project",
    authScopes: { hasRole: true },
    args: {
      projectId: t.arg.int({ required: true }),
      name: t.arg.string({ required: true }),
    },
    resolve: async (_query, _root, args, ctx) => {
      const project = await ctx.prisma.project.findFirstOrThrow({
        where: { organizationId: (ctx.me as AuthRoleContext).organizationId, id: args.projectId },
      });
      return renameProject(project, args.name);
    },
  }),
);

builder.mutationField("publishProject", (t) =>
  t.prismaField({
    type: "Project",
    authScopes: { hasRole: true },
    args: { projectId: t.arg.int({ required: true }) },
    resolve: async (query, _root, args, ctx) => {
      const project = await ctx.prisma.project.findFirstOrThrow({
        where: { organizationId: (ctx.me as AuthRoleContext).organizationId, id: args.projectId, stage: ModelStage.DRAFT },
      });
      return ctx.prisma.project.update({ ...query, where: { id: project.id }, data: { stage: ModelStage.PUBLISHED } });
    },
  }),
);

builder.mutationField("updateProjectOwner", (t) =>
  t.prismaField({
    type: "Project",
    authScopes: { hasRole: true },
    args: {
      projectId: t.arg.int({ required: true }),
      ownerId: t.arg.int({ required: false }),
    },
    resolve: async (query, _root, args, ctx) => {
      const project = await ctx.prisma.project.findFirstOrThrow({
        where: { organizationId: (ctx.me as AuthRoleContext).organizationId, id: args.projectId },
      });

      if (args.ownerId === null || args.ownerId === undefined) {
        return ctx.prisma.project.update({ ...query, where: { id: project.id }, data: { ownerId: null } });
      }

      const owner = await ctx.prisma.role.findFirstOrThrow({
        where: { id: args.ownerId, organizationId: (ctx.me as AuthRoleContext).organizationId, status: RoleStatus.ACCEPTED },
      });

      return ctx.prisma.project.update({ ...query, where: { id: project.id }, data: { ownerId: owner.id } });
    },
  }),
);

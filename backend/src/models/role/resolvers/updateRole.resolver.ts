/**
 * Role update mutations: updateRole, pinProject, unpinProject,
 * updateRoleWorkWeek, updateMyRole.
 */

import builder from "../../../schema/builder";
import { RoleTypeEnum } from "../../../schema/enums";
import { RoleStatus, RoleType, UserStatus, Prisma } from "@prisma/client";
import { GraphQLError } from "graphql";
import { requestEstimate } from "../../ticket/jobs/estimateTickets";
import { some } from "lodash";
import { AuthRoleContext } from "../../../types";

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

const WorkDayTimeInput = builder.inputType("WorkDayTimeInput", {
  fields: (t) => ({
    startTime: t.string({ required: true }),
    stopTime: t.string({ required: true }),
  }),
});

const UpdateRoleWorkWeekInput = builder.inputType("UpdateRoleWorkWeekInput", {
  fields: (t) => ({
    monday: t.field({ type: [WorkDayTimeInput], required: { list: true, items: false } }),
    tuesday: t.field({ type: [WorkDayTimeInput], required: { list: true, items: false } }),
    wednesday: t.field({ type: [WorkDayTimeInput], required: { list: true, items: false } }),
    thursday: t.field({ type: [WorkDayTimeInput], required: { list: true, items: false } }),
    friday: t.field({ type: [WorkDayTimeInput], required: { list: true, items: false } }),
    saturday: t.field({ type: [WorkDayTimeInput], required: { list: true, items: false } }),
    sunday: t.field({ type: [WorkDayTimeInput], required: { list: true, items: false } }),
  }),
});

const UpdateRoleInput = builder.inputType("UpdateRoleInput", {
  fields: (t) => ({
    title: t.string({ required: false }),
    type: t.field({ type: RoleTypeEnum, required: false }),
  }),
});

const UpdateMyRoleInput = builder.inputType("UpdateMyRoleInput", {
  fields: (t) => ({
    name: t.string({ required: false }),
    description: t.string({ required: false }),
    timeZone: t.string({ required: false }),
    avatarUrl: t.string({ required: false }),
    coverUrl: t.string({ required: false }),
  }),
});

// ---------------------------------------------------------------------------
// Mutation: updateRole
// ---------------------------------------------------------------------------

builder.mutationField("updateRole", (t) =>
  t.prismaField({
    type: "Role",
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      roleId: t.arg.int({ required: true }),
      input: t.arg({ type: UpdateRoleInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const role = await ctx.prisma.role.findFirstOrThrow({
        where: {
          id: args.roleId,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
        },
      });

      const roleInput: Prisma.RoleUpdateInput = {
        title: args.input.title ?? undefined,
      };

      if (args.input.type && args.input.type !== role.type) {
        if (args.roleId === (ctx.me as AuthRoleContext).roleId) {
          throw new GraphQLError("You cannot change your own role level", { extensions: { code: "BAD_USER_INPUT" } });
        }

        if (role.type === RoleType.OWNER && (ctx.me as AuthRoleContext).roleType !== RoleType.OWNER) {
          throw new GraphQLError("only Owner can change role level of another owner", { extensions: { code: "BAD_USER_INPUT" } });
        }

        if (args.input.type === RoleType.OWNER && (ctx.me as AuthRoleContext).roleType !== RoleType.OWNER) {
          throw new GraphQLError("Only owner can promote another person to owner", { extensions: { code: "BAD_USER_INPUT" } });
        }

        roleInput.type = args.input.type;
      }

      return ctx.prisma.role.update({
        ...query,
        where: { id: role.id },
        data: roleInput,
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Mutation: pinProject
// ---------------------------------------------------------------------------

builder.mutationField("pinProject", (t) =>
  t.prismaField({
    type: "Role",
    authScopes: { hasRole: true },
    args: {
      projectId: t.arg.int({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const project = await ctx.prisma.project.findFirstOrThrow({
        where: {
          organizationId: (ctx.me as AuthRoleContext).organizationId,
          id: args.projectId,
        },
      });

      return ctx.prisma.role.update({
        ...query,
        where: { id: (ctx.me as AuthRoleContext).roleId },
        data: {
          pinnedProjects: { connect: { id: project.id } },
        },
        include: { ...query.include, pinnedProjects: true },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Mutation: unpinProject
// ---------------------------------------------------------------------------

builder.mutationField("unpinProject", (t) =>
  t.prismaField({
    type: "Role",
    authScopes: { hasRole: true },
    args: {
      projectId: t.arg.int({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const project = await ctx.prisma.project.findFirstOrThrow({
        where: {
          organizationId: (ctx.me as AuthRoleContext).organizationId,
          id: args.projectId,
        },
      });

      return ctx.prisma.role.update({
        ...query,
        where: { id: (ctx.me as AuthRoleContext).roleId },
        data: {
          pinnedProjects: { disconnect: { id: project.id } },
        },
        include: { ...query.include, pinnedProjects: true },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Mutation: updateRoleWorkWeek
// ---------------------------------------------------------------------------

builder.mutationField("updateRoleWorkWeek", (t) =>
  t.prismaField({
    type: "Role",
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      roleId: t.arg.int({ required: true }),
      input: t.arg({ type: UpdateRoleWorkWeekInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const role = await ctx.prisma.role.findFirstOrThrow({
        where: {
          id: args.roleId,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
        },
      });

      const input = args.input;

      const isEmpty = !some([
        input.monday.length,
        input.tuesday.length,
        input.wednesday.length,
        input.thursday.length,
        input.friday.length,
        input.saturday.length,
        input.sunday.length,
      ]);

      if (isEmpty) {
        throw new GraphQLError("Schedule cannot be empty", { extensions: { code: "BAD_USER_INPUT" } });
      }

      const assertNoOverlap = (hours: typeof input.monday, day: string) => {
        // Nullable-item list — strip nulls before overlap checks
        const validHours = hours.filter((h): h is NonNullable<typeof h> => h != null);
        const hoursCopy = [...validHours];
        let timeBlock;

        while ((timeBlock = hoursCopy.pop())) {
          for (const otherTimeBlock of validHours) {
            if (
              timeBlock.startTime > otherTimeBlock.startTime &&
              timeBlock.startTime < otherTimeBlock.stopTime
            ) {
              throw new GraphQLError(`A time overlap has been found on ${day}`, { extensions: { code: "BAD_USER_INPUT" } });
            }
            if (
              timeBlock.stopTime > otherTimeBlock.startTime &&
              timeBlock.stopTime < otherTimeBlock.stopTime
            ) {
              throw new GraphQLError(`A time overlap has been found on ${day}`, { extensions: { code: "BAD_USER_INPUT" } });
            }
          }
        }
      };

      assertNoOverlap(input.monday, "Monday");
      assertNoOverlap(input.tuesday, "Tuesday");
      assertNoOverlap(input.wednesday, "Wednesday");
      assertNoOverlap(input.thursday, "Thursday");
      assertNoOverlap(input.friday, "Friday");
      assertNoOverlap(input.saturday, "Saturday");
      assertNoOverlap(input.sunday, "Sunday");

      requestEstimate((ctx.me as AuthRoleContext).organizationId);

      return ctx.prisma.role.update({
        ...query,
        where: { id: role.id },
        data: { workWeek: JSON.stringify(input) },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Mutation: updateMyRole
// ---------------------------------------------------------------------------

builder.mutationField("updateMyRole", (t) =>
  t.prismaField({
    type: "Role",
    authScopes: { isAuthenticated: true },
    args: {
      input: t.arg({ type: UpdateMyRoleInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const role = await ctx.prisma.role.findFirst({
        where: { id: (ctx.me as AuthRoleContext).roleId },
        include: { user: true },
      });

      if (!role) {
        throw new GraphQLError("This role does not exist or has been deleted", { extensions: { code: "BAD_USER_INPUT" } });
      }

      if (role.status !== RoleStatus.ACCEPTED) {
        throw new GraphQLError("This role cannot be updated at this time", { extensions: { code: "BAD_USER_INPUT" } });
      }

      if (role.user.status !== UserStatus.ACTIVE) {
        throw new GraphQLError("This user is not ACTIVE", { extensions: { code: "BAD_USER_INPUT" } });
      }

      return ctx.prisma.role.update({
        ...query,
        where: { id: (ctx.me as AuthRoleContext).roleId },
        data: {
          name: args.input.name ?? undefined,
          description: args.input.description ?? undefined,
          avatarUrl: args.input.avatarUrl ?? undefined,
          coverUrl: args.input.coverUrl ?? undefined,
          timeZone: args.input.timeZone ?? undefined,
        },
      });
    },
  }),
);

/**
 * Role preference mutations: updateRolePreferences, updateRoleNoteColorPreferences,
 * addToRecentSearchHit, updateRoleEmail, updateRoleStartReminder, updateRoleAutoResume.
 */

import builder from "../../../schema/builder";
import { NoteColorEnum } from "../../../schema/enums";
import { getRolePreferences, updateRolePreferences } from "../entity";
import { getNextWorkDayStartDate } from "../jobs/workDayEmail";
import { getNextReminderStartDate } from "../jobs/startReminder";
import { config } from "../../../config";
import { without } from "lodash";
import { AuthRoleContext } from "../../../types";

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

const UpdateRolePreferencesInput = builder.inputType("UpdateRolePreferencesInput", {
  fields: (t) => ({
    showOnboarding: t.boolean({ required: true }),
  }),
});

const UpdateRoleEmailInput = builder.inputType("UpdateRoleEmailInput", {
  fields: (t) => ({
    nextWorkDayNotificationOptOut: t.boolean({ required: true }),
  }),
});

const UpdateRoleNoteColorsInput = builder.inputType("UpdateRoleNoteColorsInput", {
  fields: (t) => ({
    color: t.field({ type: NoteColorEnum, required: true }),
    value: t.string({ required: true }),
  }),
});

const UpdateRoleStartReminderInput = builder.inputType("UpdateRoleStartReminderInput", {
  fields: (t) => ({
    nextStartNotificationOptOut: t.boolean({ required: true }),
  }),
});

const UpdateRoleAutoResumeInput = builder.inputType("UpdateRoleAutoResumeInput", {
  fields: (t) => ({
    nextStartNotificationOptOut: t.boolean({ required: true }),
  }),
});

// ---------------------------------------------------------------------------
// Mutation: updateRolePreferences (onboarding)
// ---------------------------------------------------------------------------

builder.mutationField("updateRolePreferences", (t) =>
  t.prismaField({
    type: "Role",
    authScopes: { hasRole: true },
    args: {
      input: t.arg({ type: UpdateRolePreferencesInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const role = await (ctx.me as AuthRoleContext).getRole();

      const preferences = updateRolePreferences(role, {
        showOnboarding: args.input.showOnboarding,
      });

      return ctx.prisma.role.update({
        ...query,
        where: { id: (ctx.me as AuthRoleContext).roleId },
        data: { preferences: JSON.stringify(preferences) },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Mutation: updateRoleNoteColorPreferences
// ---------------------------------------------------------------------------

builder.mutationField("updateRoleNoteColorPreferences", (t) =>
  t.prismaField({
    type: "Role",
    authScopes: { hasRole: true },
    args: {
      input: t.arg({ type: UpdateRoleNoteColorsInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const role = await (ctx.me as AuthRoleContext).getRole();

      const preferences = updateRolePreferences(role, {
        noteColors: {
          ...getRolePreferences(role).noteColors,
          [args.input.color]: args.input.value,
        },
      });

      return ctx.prisma.role.update({
        ...query,
        where: { id: (ctx.me as AuthRoleContext).roleId },
        data: { preferences: JSON.stringify(preferences) },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Mutation: addToRecentSearchHit (deprecated)
// ---------------------------------------------------------------------------

builder.mutationField("addToRecentSearchHit", (t) =>
  t.prismaField({
    type: "Role",
    authScopes: { hasRole: true },
    deprecationReason: "We store and display recently visited project and ticket instead",
    args: {
      searchResult: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const role = await (ctx.me as AuthRoleContext).getRole();
      const preferences = getRolePreferences(role);

      if (preferences.recentSearchHits.indexOf(args.searchResult) > -1) {
        preferences.recentSearchHits = without(
          preferences.recentSearchHits,
          args.searchResult,
        );
      }

      if (preferences.recentSearchHits.length > 9) {
        preferences.recentSearchHits.pop();
      }

      preferences.recentSearchHits.unshift(args.searchResult);

      return ctx.prisma.role.update({
        ...query,
        where: { id: (ctx.me as AuthRoleContext).roleId },
        data: { preferences: JSON.stringify(preferences) },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Mutation: updateRoleEmail
// ---------------------------------------------------------------------------

builder.mutationField("updateRoleEmail", (t) =>
  t.prismaField({
    type: "RoleEmail",
    authScopes: { hasRole: true },
    args: {
      input: t.arg({ type: UpdateRoleEmailInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const roleEmail = await ctx.prisma.roleEmail.findFirst({
        where: { roleId: (ctx.me as AuthRoleContext).roleId },
      });

      const role = await ctx.prisma.role.findUniqueOrThrow({
        where: { id: (ctx.me as AuthRoleContext).roleId },
      });

      if (!roleEmail) {
        return ctx.prisma.roleEmail.create({
          ...query,
          data: {
            roleId: (ctx.me as AuthRoleContext).roleId,
            nextWorkDayNotificationOptOut: args.input.nextWorkDayNotificationOptOut,
            nextWorkDayNotificationDate: await getNextWorkDayStartDate(role, new Date()),
          },
        });
      } else {
        return ctx.prisma.roleEmail.update({
          ...query,
          where: { roleId: (ctx.me as AuthRoleContext).roleId },
          data: {
            nextWorkDayNotificationOptOut: args.input.nextWorkDayNotificationOptOut,
            nextWorkDayNotificationDate: await getNextWorkDayStartDate(role, new Date()),
          },
        });
      }
    },
  }),
);

// ---------------------------------------------------------------------------
// Mutation: updateRoleStartReminder
// ---------------------------------------------------------------------------

builder.mutationField("updateRoleStartReminder", (t) =>
  t.prismaField({
    type: "RoleStartReminder",
    authScopes: { hasRole: true },
    args: {
      input: t.arg({ type: UpdateRoleStartReminderInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const roleStartReminder = await ctx.prisma.roleStartReminder.findFirst({
        where: { roleId: (ctx.me as AuthRoleContext).roleId },
      });

      const role = await ctx.prisma.role.findUniqueOrThrow({
        where: { id: (ctx.me as AuthRoleContext).roleId },
      });

      if (!roleStartReminder) {
        return ctx.prisma.roleStartReminder.create({
          ...query,
          data: {
            roleId: (ctx.me as AuthRoleContext).roleId,
            nextStartNotificationOptOut: args.input.nextStartNotificationOptOut,
            nextStartNotificationDate: await getNextReminderStartDate(
              role,
              new Date(),
              config.workReminderOffset,
            ),
          },
        });
      } else {
        return ctx.prisma.roleStartReminder.update({
          ...query,
          where: { roleId: (ctx.me as AuthRoleContext).roleId },
          data: {
            nextStartNotificationOptOut: args.input.nextStartNotificationOptOut,
            nextStartNotificationDate: await getNextReminderStartDate(
              role,
              new Date(),
              config.workReminderOffset,
            ),
          },
        });
      }
    },
  }),
);

// ---------------------------------------------------------------------------
// Mutation: updateRoleAutoResume
// ---------------------------------------------------------------------------

builder.mutationField("updateRoleAutoResume", (t) =>
  t.prismaField({
    type: "RoleAutoResume",
    authScopes: { hasRole: true },
    args: {
      input: t.arg({ type: UpdateRoleAutoResumeInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const roleAutoResume = await ctx.prisma.roleAutoResume.findFirst({
        where: { roleId: (ctx.me as AuthRoleContext).roleId },
        include: { role: true },
      });

      if (!roleAutoResume) {
        const role = await ctx.prisma.role.findUniqueOrThrow({
          where: { id: (ctx.me as AuthRoleContext).roleId },
        });

        return ctx.prisma.roleAutoResume.create({
          ...query,
          data: {
            roleId: (ctx.me as AuthRoleContext).roleId,
            nextStartNotificationOptOut: args.input.nextStartNotificationOptOut,
            nextStartNotificationDate: await getNextReminderStartDate(
              role,
              new Date(),
              0,
            ),
          },
        });
      } else {
        return ctx.prisma.roleAutoResume.update({
          ...query,
          where: { roleId: (ctx.me as AuthRoleContext).roleId },
          data: {
            nextStartNotificationOptOut: args.input.nextStartNotificationOptOut,
            nextStartNotificationDate: await getNextReminderStartDate(
              roleAutoResume.role,
              new Date(),
              0,
            ),
          },
        });
      }
    },
  }),
);

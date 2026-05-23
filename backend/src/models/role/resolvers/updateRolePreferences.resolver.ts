import {
  Arg,
  Resolver,
  Mutation,
  InputType,
  Field,
  UseMiddleware,
  Ctx,
} from "type-graphql";

import {
  Role,
  RoleEmail,
  RoleStartReminder,
  RoleAutoResume,
  NoteColor,
} from "@generated/type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import { getRolePreferences, updateRolePreferences } from "../entity";
import { getNextWorkDayStartDate } from "../jobs/workDayEmail";
import { without } from "lodash";
import { getNextReminderStartDate } from "../jobs/startReminder";
import { config } from "../../../config";

@InputType()
class UpdateRolePreferencesInput {
  @Field((_type) => Boolean)
  showOnboarding: boolean;
}

@InputType()
class UpdateRoleEmailInput {
  @Field((_type) => Boolean)
  nextWorkDayNotificationOptOut: boolean;
}

@InputType()
class UpdateRoleNotColorsInput {
  @Field((_type) => NoteColor)
  color: NoteColor;

  @Field((_type) => String)
  value: string;
}

@InputType()
class UpdateRoleStartReminderInput {
  @Field((_type) => Boolean)
  nextStartNotificationOptOut: boolean;
}

@InputType()
class UpdateRoleAutoResumeInput {
  @Field((_type) => Boolean)
  nextStartNotificationOptOut: boolean;
}

@Resolver(Role)
export class UpdateRolePreferencesResolver {
  // TODO: This method should be renamed UpdateOnboardingPreference
  // but I'm not even sure we should keep that feature yet since
  // it is not fully built
  @Mutation(() => Role)
  @UseMiddleware(hasRole())
  async updateRolePreferences(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("input", () => UpdateRolePreferencesInput)
    input: UpdateRolePreferencesInput
  ): Promise<Role> {
    const role = await ctx.me.getRole();

    const preferences = updateRolePreferences(role, {
      showOnboarding: input.showOnboarding,
    });

    return ctx.prisma.role.update({
      where: { id: ctx.me.roleId },
      data: { preferences: JSON.stringify(preferences) },
    });
  }

  @Mutation(() => Role)
  @UseMiddleware(hasRole())
  async updateRoleNoteColorPreferences(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("input", () => UpdateRoleNotColorsInput)
    input: UpdateRoleNotColorsInput
  ): Promise<Role> {
    const role = await ctx.me.getRole();

    const preferences = updateRolePreferences(role, {
      noteColors: {
        ...getRolePreferences(role).noteColors,
        [input.color]: input.value,
      },
    });

    return ctx.prisma.role.update({
      where: { id: ctx.me.roleId },
      data: { preferences: JSON.stringify(preferences) },
    });
  }

  // FIXME: To be remove after november 1st, 2023
  @Mutation(() => Role, {
    deprecationReason:
      "We store and display recently visited project and ticket instead",
  })
  @UseMiddleware(hasRole())
  async addToRecentSearchHit(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("searchResult", () => String)
    searchResult: string
  ): Promise<Role> {
    const role = await ctx.me.getRole();
    const preferences = getRolePreferences(role);

    // if the search result is already in the list, remove it so it
    // will get push to the top of the list after
    if (preferences.recentSearchHits.indexOf(searchResult) > -1) {
      preferences.recentSearchHits = without(
        preferences.recentSearchHits,
        searchResult
      );
    }

    // remove last search hit if we reach 10 stored results
    if (preferences.recentSearchHits.length > 9) {
      preferences.recentSearchHits.pop();
    }

    preferences.recentSearchHits.unshift(searchResult);

    return ctx.prisma.role.update({
      where: { id: ctx.me.roleId },
      data: { preferences: JSON.stringify(preferences) },
    });
  }

  @Mutation(() => RoleEmail)
  @UseMiddleware(hasRole())
  async updateRoleEmail(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("input", () => UpdateRoleEmailInput)
    input: UpdateRoleEmailInput
  ): Promise<RoleEmail> {
    let roleEmail = await ctx.prisma.roleEmail.findFirst({
      where: {
        roleId: ctx.me.roleId,
      },
    });

    const role = await ctx.prisma.role.findUniqueOrThrow({
      where: { id: ctx.me.roleId },
    });

    if (!roleEmail) {
      return ctx.prisma.roleEmail.create({
        data: {
          roleId: ctx.me.roleId,
          nextWorkDayNotificationOptOut: input.nextWorkDayNotificationOptOut,
          nextWorkDayNotificationDate: await getNextWorkDayStartDate(
            role,
            new Date()
          ),
        },
      });
    } else {
      return ctx.prisma.roleEmail.update({
        where: { roleId: ctx.me.roleId },
        data: {
          nextWorkDayNotificationOptOut: input.nextWorkDayNotificationOptOut,
          nextWorkDayNotificationDate: await getNextWorkDayStartDate(
            role,
            new Date()
          ),
        },
      });
    }
  }

  @Mutation(() => RoleStartReminder)
  @UseMiddleware(hasRole())
  async updateRoleStartReminder(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("input", () => UpdateRoleStartReminderInput)
    input: UpdateRoleStartReminderInput
  ): Promise<RoleStartReminder> {
    let roleStartReminder = await ctx.prisma.roleStartReminder.findFirst({
      where: {
        roleId: ctx.me.roleId,
      },
    });

    const role = await ctx.prisma.role.findUniqueOrThrow({
      where: { id: ctx.me.roleId },
    });

    if (!roleStartReminder) {
      return ctx.prisma.roleStartReminder.create({
        data: {
          roleId: ctx.me.roleId,
          nextStartNotificationOptOut: input.nextStartNotificationOptOut,
          nextStartNotificationDate: await getNextReminderStartDate(
            role,
            new Date(),
            config.workReminderOffset
          ),
        },
      });
    } else {
      return ctx.prisma.roleStartReminder.update({
        where: { roleId: ctx.me.roleId },
        data: {
          nextStartNotificationOptOut: input.nextStartNotificationOptOut,
          nextStartNotificationDate: await getNextReminderStartDate(
            role,
            new Date(),
            config.workReminderOffset
          ),
        },
      });
    }
  }

  @Mutation(() => RoleAutoResume)
  @UseMiddleware(hasRole())
  async updateRoleAutoResume(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("input", () => UpdateRoleAutoResumeInput)
    input: UpdateRoleAutoResumeInput
  ): Promise<RoleAutoResume> {
    let roleAutoResume = await ctx.prisma.roleAutoResume.findFirst({
      where: {
        roleId: ctx.me.roleId,
      },
      include: { role: true },
    });

    if (!roleAutoResume) {
      const role = await ctx.prisma.role.findUniqueOrThrow({
        where: { id: ctx.me.roleId },
      });

      return ctx.prisma.roleAutoResume.create({
        data: {
          roleId: ctx.me.roleId,
          nextStartNotificationOptOut: input.nextStartNotificationOptOut,
          nextStartNotificationDate: await getNextReminderStartDate(
            role,
            new Date(),
            0
          ),
        },
      });
    } else {
      return ctx.prisma.roleAutoResume.update({
        where: { roleId: ctx.me.roleId },
        data: {
          nextStartNotificationOptOut: input.nextStartNotificationOptOut,
          nextStartNotificationDate: await getNextReminderStartDate(
            roleAutoResume.role,
            new Date(),
            0
          ),
        },
      });
    }
  }
}

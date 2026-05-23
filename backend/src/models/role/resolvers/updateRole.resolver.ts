import {
  Arg,
  Resolver,
  Mutation,
  InputType,
  Field,
  Int,
  UseMiddleware,
  Ctx,
} from "type-graphql";

import { IsIn, IsUrl, Length, MaxLength } from "class-validator";
import {
  Role,
  RoleStatus,
  RoleType,
  UserStatus,
} from "@generated/type-graphql";
import { UserInputError } from "apollo-server-express";
import { hasRole, isAuthenticated } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import { listTimeZones } from "timezone-support";
import { requestEstimate } from "../../ticket/jobs/estimateTickets";
import { some } from "lodash";
import { Prisma } from "@prisma/client";

@InputType()
class WorkDayTimeInput {
  @Field()
  @Length(1, 128)
  startTime: string;

  @Field()
  @Length(1, 128)
  stopTime: string;
}

@InputType()
class UpdateRoleWorkWeekInput {
  @Field((_type) => [WorkDayTimeInput], { nullable: "items" })
  monday: WorkDayTimeInput[];
  @Field((_type) => [WorkDayTimeInput], { nullable: "items" })
  tuesday: WorkDayTimeInput[];
  @Field((_type) => [WorkDayTimeInput], { nullable: "items" })
  wednesday: WorkDayTimeInput[];
  @Field((_type) => [WorkDayTimeInput], { nullable: "items" })
  thursday: WorkDayTimeInput[];
  @Field((_type) => [WorkDayTimeInput], { nullable: "items" })
  friday: WorkDayTimeInput[];
  @Field((_type) => [WorkDayTimeInput], { nullable: "items" })
  saturday: WorkDayTimeInput[];
  @Field((_type) => [WorkDayTimeInput], { nullable: "items" })
  sunday: WorkDayTimeInput[];
}

@InputType()
class UpdateRoleInput {
  @Field({ nullable: true })
  @Length(1, 128)
  title?: string;

  @Field(() => RoleType, { nullable: true })
  type?: RoleType;
}

@InputType()
class UpdateMyRoleInput {
  @Field({ nullable: true })
  @Length(2, 128)
  name?: string;

  @Field({ nullable: true })
  @MaxLength(2048)
  description?: string;

  @Field({ nullable: true })
  @IsIn(listTimeZones())
  timeZone?: string;

  @Field({ nullable: true })
  @MaxLength(2048)
  @IsUrl()
  avatarUrl?: string;

  @Field({ nullable: true })
  @MaxLength(2048)
  @IsUrl()
  coverUrl?: string;
}

@Resolver(Role)
export class UpdateRoleResolver {
  @Mutation(() => Role)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async updateRole(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("roleId", () => Int) roleId: number,
    @Arg("input", () => UpdateRoleInput) input: UpdateRoleInput
  ): Promise<Role> {
    const role = await ctx.prisma.role.findFirstOrThrow({
      where: {
        id: roleId,
        organizationId: ctx.me.organizationId,
      },
    });

    const roleInput: Prisma.RoleUpdateInput = {
      title: input.title,
    };

    if (input.type && input.type !== role.type) {
      if (roleId === ctx.me.roleId) {
        throw new UserInputError("You cannot change your own role level");
      }

      if (role.type === RoleType.OWNER && ctx.me.roleType !== RoleType.OWNER) {
        throw new UserInputError(
          "only Owner can change role level of another owner"
        );
      }

      if (input.type === RoleType.OWNER && ctx.me.roleType !== RoleType.OWNER) {
        throw new UserInputError(
          "Only owner can promote another person to owner"
        );
      }

      roleInput.type = input.type;
    }

    return ctx.prisma.role.update({
      where: { id: role.id },
      data: roleInput,
    });
  }

  @Mutation(() => Role)
  @UseMiddleware(hasRole([]))
  async updateRolePreferences(@Ctx() ctx: AppContext<AuthRoleContext>) {
    console.log(ctx.me.roleId);
  }

  @Mutation(() => Role)
  @UseMiddleware(hasRole([]))
  async pinProject(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("projectId", () => Int) projectId: number
  ): Promise<Role> {
    let project = await ctx.prisma.project.findFirstOrThrow({
      where: {
        organizationId: ctx.me.organizationId,
        id: projectId,
      },
    });

    return ctx.prisma.role.update({
      where: { id: ctx.me.roleId },
      data: {
        pinnedProjects: { connect: { id: project.id } },
      },
      include: {
        pinnedProjects: true,
      },
    });
  }

  @Mutation(() => Role)
  @UseMiddleware(hasRole([]))
  async unpinProject(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("projectId", () => Int) projectId: number
  ): Promise<Role> {
    const project = await ctx.prisma.project.findFirstOrThrow({
      where: {
        organizationId: ctx.me.organizationId,
        id: projectId,
      },
    });

    return ctx.prisma.role.update({
      where: { id: ctx.me.roleId },
      data: {
        pinnedProjects: { disconnect: { id: project.id } },
      },
      include: {
        pinnedProjects: true,
      },
    });
  }

  @Mutation(() => Role)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async updateRoleWorkWeek(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("roleId", () => Int) roleId: number,
    @Arg("input", () => UpdateRoleWorkWeekInput) input: UpdateRoleWorkWeekInput
  ): Promise<Role> {
    const role = await ctx.prisma.role.findFirstOrThrow({
      where: {
        id: roleId,
        organizationId: ctx.me.organizationId,
      },
    });

    const empty = !some([
      input.monday.length,
      input.tuesday.length,
      input.wednesday.length,
      input.thursday.length,
      input.friday.length,
      input.saturday.length,
      input.sunday.length,
    ]);

    if (empty) {
      throw new UserInputError("Schedule cannot be empty");
    }

    const assertNoOverlap = (hours: WorkDayTimeInput[], day: string) => {
      // we will pop its content, so we want to copy it to not mutate the original
      const hoursCopy = [...hours];
      let timeBlock;

      while ((timeBlock = hoursCopy.pop())) {
        for (const otherTimeBlock of hours) {
          // detects if the start time is within another time block
          if (
            timeBlock.startTime > otherTimeBlock.startTime &&
            timeBlock.startTime < otherTimeBlock.stopTime
          ) {
            throw new UserInputError(`A time overlap has been found on ${day}`);
          }

          // detects if the stop time is within another time block
          if (
            timeBlock.stopTime > otherTimeBlock.startTime &&
            timeBlock.stopTime < otherTimeBlock.stopTime
          ) {
            throw new UserInputError(`A time overlap has been found on ${day}`);
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

    requestEstimate(ctx.me.organizationId);

    return ctx.prisma.role.update({
      where: { id: role.id },
      data: {
        workWeek: JSON.stringify(input),
      },
    });
  }

  @Mutation(() => Role)
  @UseMiddleware(isAuthenticated)
  async updateMyRole(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("input", () => UpdateMyRoleInput) input: UpdateMyRoleInput
  ): Promise<Role> {
    const role = await ctx.prisma.role.findFirst({
      where: { id: ctx.me.roleId },
      include: { user: true },
    });

    // Todo: prevent email change through regular profile update
    // instead provide an endpoint that re-request the password
    // when changing the email
    if (!role) {
      throw new UserInputError("This role does not exist or has been deleted");
    }

    if (role.status !== RoleStatus.ACCEPTED) {
      throw new UserInputError("This role cannot be updated at this time");
    }

    if (role.user.status !== UserStatus.ACTIVE) {
      throw new UserInputError("This user is not ACTIVE");
    }

    // only update other role name if it has not been changed
    return ctx.prisma.role.update({
      where: {
        id: ctx.me.roleId,
      },
      data: {
        name: input.name,
        description: input.description,
        avatarUrl: input.avatarUrl,
        coverUrl: input.coverUrl,
        timeZone: input.timeZone,
      },
    });
  }
}

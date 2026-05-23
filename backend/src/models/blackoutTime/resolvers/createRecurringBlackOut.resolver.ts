import {
  Arg,
  Resolver,
  Mutation,
  InputType,
  Field,
  UseMiddleware,
  Ctx,
  Int,
} from "type-graphql";

import { Length } from "class-validator";
import { RecurringBlackoutTime } from "@generated/type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import { UserInputError } from "apollo-server-express";
import { requestEstimate } from "../../ticket/jobs/estimateTickets";
import { RoleType } from "@prisma/client";
import { IsMilitaryTime } from "../../../validator/TimeValidator";

@InputType()
class CreateRecurringBlackoutTimeInput {
  @Field()
  name: string;

  @Field()
  @IsMilitaryTime()
  @Length(1, 128)
  startTime: string;

  @Field()
  @IsMilitaryTime()
  @Length(1, 128)
  stopTime: string;

  @Field(() => [Int])
  roleIds: number[];

  @Field(() => Boolean, { nullable: true })
  monday?: boolean;

  @Field(() => Boolean, { nullable: true })
  tuesday?: boolean;

  @Field(() => Boolean, { nullable: true })
  wednesday?: boolean;

  @Field(() => Boolean, { nullable: true })
  thursday?: boolean;

  @Field(() => Boolean, { nullable: true })
  friday?: boolean;

  @Field(() => Boolean, { nullable: true })
  saturday?: boolean;

  @Field(() => Boolean, { nullable: true })
  sunday?: boolean;
}

@Resolver()
export class CreateRecurringBlackoutTimeResolver {
  @Mutation(() => RecurringBlackoutTime)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async createRecurringBlackoutTime(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("input")
    input: CreateRecurringBlackoutTimeInput
  ): Promise<RecurringBlackoutTime> {
    let { startTime, stopTime } = input;

    if (startTime === stopTime) {
      throw new UserInputError("start and stop time cannot be identical");
    }

    if (startTime > stopTime) {
      [startTime, stopTime] = [stopTime, startTime];
    }

    const roles = await ctx.prisma.role.findMany({
      where: {
        organizationId: ctx.me.organizationId,
        id: { in: input.roleIds },
      },
    });

    const recurringBlackoutTime = await ctx.prisma.recurringBlackoutTime.create(
      {
        data: {
          name: input.name,
          organizationId: ctx.me.organizationId,
          roles: { connect: roles.map((role) => ({ id: role.id })) },
          startTime,
          stopTime,
          timeZone: (await ctx.me.getRole()).timeZone,
          monday: input.monday,
          tuesday: input.tuesday,
          wednesday: input.wednesday,
          thursday: input.thursday,
          friday: input.friday,
          saturday: input.saturday,
          sunday: input.sunday,
          disabled: false,
        },
      }
    );

    await requestEstimate(ctx.me.organizationId);

    return recurringBlackoutTime;
  }
}

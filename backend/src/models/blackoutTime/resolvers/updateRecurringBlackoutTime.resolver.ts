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

import { IsTimeZone, Length } from "class-validator";
import { RecurringBlackoutTime } from "@generated/type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import { RoleType } from "@prisma/client";
import { requestEstimate } from "../../ticket/jobs/estimateTickets";

@InputType()
class UpdateRecurringBlackoutTimeInput {
  @Field()
  @Length(1, 128)
  name: string;

  @Field()
  @IsTimeZone()
  @Length(1, 128)
  timeZone: string;

  @Field()
  startTime: string;

  @Field()
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

  @Field(() => Boolean, { nullable: true })
  disabled?: boolean;
}

@Resolver(RecurringBlackoutTime)
export class UpdateRecurringBlackoutTimeResolver {
  @Mutation(() => RecurringBlackoutTime)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async updateRecurringBlackoutTime(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("recurringBlackoutTimeId", () => Int) recurringBlackoutTimeId: number,
    @Arg("input")
    input: UpdateRecurringBlackoutTimeInput
  ): Promise<RecurringBlackoutTime> {
    let { startTime, stopTime } = input;

    if (startTime > stopTime) {
      [startTime, stopTime] = [stopTime, startTime];
    }

    const recurringBlackoutTime =
      await ctx.prisma.recurringBlackoutTime.findFirstOrThrow({
        where: {
          id: recurringBlackoutTimeId,
          organizationId: ctx.me.organizationId,
        },
      });

    const roles = await ctx.prisma.role.findMany({
      where: {
        organizationId: ctx.me.organizationId,
        id: { in: input.roleIds },
      },
    });

    await requestEstimate(ctx.me.organizationId);

    return ctx.prisma.recurringBlackoutTime.update({
      where: {
        id: recurringBlackoutTime.id,
      },
      data: {
        name: input.name,
        startTime,
        stopTime,
        timeZone: input.timeZone,
        roles: { set: roles.map((role) => ({ id: role.id })) },
        monday: input.monday,
        tuesday: input.tuesday,
        wednesday: input.wednesday,
        thursday: input.thursday,
        friday: input.friday,
        saturday: input.saturday,
        sunday: input.sunday,
        disabled: input.disabled,
      },
    });
  }
}

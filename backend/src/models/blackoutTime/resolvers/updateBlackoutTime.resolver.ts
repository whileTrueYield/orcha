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

import { IsISO8601, Length } from "class-validator";
import { BlackoutTime } from "@generated/type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import { RoleType } from "@prisma/client";
import { utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";
import { endOfDay, startOfDay } from "date-fns";
import { requestEstimate } from "../../ticket/jobs/estimateTickets";

@InputType()
class UpdateBlackoutTimeInput {
  @Field()
  @Length(1, 128)
  name: string;

  @Field()
  @IsISO8601({ strict: true })
  startAt: string;

  @Field()
  @IsISO8601({ strict: true })
  stopAt: string;

  @Field(() => [Int])
  roleIds: number[];

  @Field(() => Boolean, { nullable: true })
  disabled?: boolean;
}

@Resolver(BlackoutTime)
export class UpdateBlackoutTimeResolver {
  @Mutation(() => BlackoutTime)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async updateBlackoutTime(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("blackoutTimeId", () => Int) blackoutTimeId: number,
    @Arg("input")
    input: UpdateBlackoutTimeInput
  ): Promise<BlackoutTime> {
    let { startAt, stopAt } = input;

    // flip values if start date is after stop date
    if (startAt > stopAt) {
      [startAt, stopAt] = [stopAt, startAt];
    }

    const blackoutTime = await ctx.prisma.blackoutTime.findFirstOrThrow({
      where: {
        id: blackoutTimeId,
        organizationId: ctx.me.organizationId,
      },
    });

    const roles = await ctx.prisma.role.findMany({
      where: {
        organizationId: ctx.me.organizationId,
        id: { in: input.roleIds },
      },
    });

    let timeZone = (await ctx.me.getRole()).timeZone;
    if (roles.length === 1) {
      timeZone = roles[0].timeZone;
    }

    await requestEstimate(ctx.me.organizationId);

    return ctx.prisma.blackoutTime.update({
      where: {
        id: blackoutTime.id,
      },
      data: {
        name: input.name,
        startAt: zonedTimeToUtc(
          startOfDay(utcToZonedTime(new Date(startAt), timeZone)),
          timeZone
        ),
        stopAt: zonedTimeToUtc(
          endOfDay(utcToZonedTime(new Date(stopAt), timeZone)),
          timeZone
        ),
        roles: { set: roles.map((role) => ({ id: role.id })) },
        disabled: input.disabled,
      },
    });
  }
}

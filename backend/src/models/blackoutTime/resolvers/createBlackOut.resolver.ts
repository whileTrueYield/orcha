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
import { requestEstimate } from "../../ticket/jobs/estimateTickets";
import { RoleType } from "@prisma/client";
import { endOfDay, startOfDay } from "date-fns";
import { utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";

@InputType()
class CreateBlackoutTimeInput {
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
}

@Resolver()
export class CreateBlackoutTimeResolver {
  @Mutation(() => BlackoutTime)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async createBlackoutTime(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("input")
    input: CreateBlackoutTimeInput
  ): Promise<BlackoutTime> {
    let { startAt, stopAt } = input;

    // flip values if start date is after stop date
    if (startAt > stopAt) {
      [startAt, stopAt] = [stopAt, startAt];
    }

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

    const blackoutTime = await ctx.prisma.blackoutTime.create({
      data: {
        name: input.name,
        organizationId: ctx.me.organizationId,
        roles: { connect: roles.map((role) => ({ id: role.id })) },
        startAt: zonedTimeToUtc(
          startOfDay(utcToZonedTime(new Date(startAt), timeZone)),
          timeZone
        ),
        stopAt: zonedTimeToUtc(
          endOfDay(utcToZonedTime(new Date(stopAt), timeZone)),
          timeZone
        ),
      },
    });

    await requestEstimate(ctx.me.organizationId);

    return blackoutTime;
  }
}

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

import { IsISO8601 } from "class-validator";
import { TimeOff } from "@generated/type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import { UserInputError } from "apollo-server-express";

@InputType()
class UpdateTimeOffInput {
  @Field()
  @IsISO8601({ strict: true })
  startAt: string;

  @Field()
  @IsISO8601({ strict: true })
  stopAt: string;
}

@Resolver(TimeOff)
export class UpdateTimeOffResolver {
  @Mutation(() => TimeOff)
  @UseMiddleware(hasRole())
  async updateTimeOff(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("timeOffId", () => Int) timeOffId: number,
    @Arg("input")
    input: UpdateTimeOffInput
  ): Promise<TimeOff> {
    let { startAt, stopAt } = input;

    if (startAt === stopAt) {
      throw new UserInputError("start and stop dates should not be identical");
    }

    // flip values if start date is after stop date
    if (startAt > stopAt) {
      [startAt, stopAt] = [stopAt, startAt];
    }

    const timeOff = await ctx.prisma.timeOff.findFirstOrThrow({
      where: {
        id: timeOffId,
        organizationId: ctx.me.organizationId,
        roleId: ctx.me.roleId,
      },
    });

    // we'll merge all overlapping time off together (excluding the edited one)
    const overlappingTimeOffs = await ctx.prisma.timeOff.findMany({
      where: {
        roleId: ctx.me.roleId,
        organizationId: ctx.me.organizationId,
        startAt: { lte: stopAt },
        stopAt: { gte: startAt },
        id: { not: timeOff.id },
      },
    });

    for (const timeOff of overlappingTimeOffs) {
      if (timeOff.startAt.toISOString() < startAt) {
        startAt = timeOff.startAt.toISOString();
      }
      if (timeOff.stopAt.toISOString() > stopAt) {
        stopAt = timeOff.stopAt.toISOString();
      }
    }

    await ctx.prisma.timeOff.deleteMany({
      where: { id: { in: overlappingTimeOffs.map(({ id }) => id) } },
    });

    return ctx.prisma.timeOff.update({
      where: {
        id: timeOff.id,
      },
      data: {
        startAt,
        stopAt,
      },
    });
  }
}

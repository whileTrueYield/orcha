import {
  Arg,
  Resolver,
  Mutation,
  InputType,
  Field,
  UseMiddleware,
  Ctx,
} from "type-graphql";

import { IsISO8601 } from "class-validator";
import { TimeOff } from "@generated/type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import { UserInputError } from "apollo-server-express";
import { requestEstimate } from "../../ticket/jobs/estimateTickets";

@InputType()
class CreateTimeOffInput {
  @Field()
  @IsISO8601({ strict: true })
  startAt: string;

  @Field()
  @IsISO8601({ strict: true })
  stopAt: string;
}

@Resolver(TimeOff)
export class CreateTimeOffResolver {
  @Mutation(() => TimeOff)
  @UseMiddleware(hasRole())
  async createTimeOff(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("input")
    input: CreateTimeOffInput
  ): Promise<TimeOff> {
    let { startAt, stopAt } = input;

    if (startAt === stopAt) {
      throw new UserInputError("start and stop dates should not be identical");
    }

    // flip values if start date is after stop date
    if (startAt > stopAt) {
      [startAt, stopAt] = [stopAt, startAt];
    }

    // we'll merge all overlapping time off together
    const overlappingTimeOffs = await ctx.prisma.timeOff.findMany({
      where: {
        roleId: ctx.me.roleId,
        organizationId: ctx.me.organizationId,
        startAt: { lte: stopAt },
        stopAt: { gte: startAt },
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

    const timeOff = await ctx.prisma.timeOff.create({
      data: {
        organizationId: ctx.me.organizationId,
        roleId: ctx.me.roleId,
        startAt,
        stopAt,
      },
    });

    await ctx.prisma.timeOff.deleteMany({
      where: { id: { in: overlappingTimeOffs.map(({ id }) => id) } },
    });

    await requestEstimate(ctx.me.organizationId);

    return timeOff;
  }
}

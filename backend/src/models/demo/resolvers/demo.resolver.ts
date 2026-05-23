import {
  Resolver,
  Ctx,
  Mutation,
  Arg,
  InputType,
  Field,
  Query,
} from "type-graphql";
import { logger } from "../../../logger";
import { AppContext, GuestUserContext } from "../../../types";
import { IsEmail } from "class-validator";
import { UserInputError, AuthenticationError } from "apollo-server-express";
import { DemoRequest } from "@generated/type-graphql";
import { randomBytes } from "crypto";
import { assertProofOfWork } from "../../auth/helper";

@InputType()
class RequestDemoInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  proof: string;

  @Field()
  hash: string;
}

// we limit the request at 1 per IP per 10 minutes
const REQUEST_RATE_LIMIT_PER_IP = 10 * 60 * 1000;

@Resolver(DemoRequest)
export class DemoResolver {
  @Query(() => DemoRequest)
  async getDemo(
    @Ctx() ctx: AppContext<GuestUserContext>,
    @Arg("id") id: string
  ): Promise<DemoRequest> {
    // find if that demo request already exist
    return ctx.prisma.demoRequest.findUniqueOrThrow({
      where: { id },
    });
  }

  @Mutation(() => DemoRequest)
  async requestDemo(
    @Ctx() ctx: AppContext<GuestUserContext>,
    @Arg("input") input: RequestDemoInput
  ): Promise<DemoRequest> {
    try {
      await assertProofOfWork(ctx.req.ip, input.hash, input.proof);
    } catch (error) {
      logger.warn(
        `requestDemo(...): Bad proof of work provided, email: ${input.email} IPs: ${ctx.req.ips},  IP: ${ctx.req.ip}`
      );
      logger.error(error);
      throw new AuthenticationError("Something went wrong, try again later");
    }

    const email = input.email.toLowerCase();

    // find if that demo request already exist
    const existingDemo = await ctx.prisma.demoRequest.findFirst({
      where: {
        email,
      },
    });

    if (existingDemo) {
      return existingDemo;
    }

    // find if this IP ran in the past 10 minutes
    const recentRequest = await ctx.prisma.demoRequest.findFirst({
      where: {
        ip_address: ctx.req.ip,
        createdAt: {
          gt: new Date(new Date().getTime() - REQUEST_RATE_LIMIT_PER_IP),
        },
      },
    });

    if (recentRequest) {
      throw new UserInputError(
        "Rate limit reached, try again in a few minutes"
      );
    }

    return ctx.prisma.demoRequest.create({
      data: {
        id: randomBytes(32).toString("hex"),
        email,
        ip_address: ctx.req.ip,
      },
    });
  }
}

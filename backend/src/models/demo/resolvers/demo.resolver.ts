/**
 * Demo resolvers — query and create demo requests.
 *
 * Exports: none (side-effect: registers `getDemo` query and `requestDemo` mutation).
 *
 * Both endpoints are public (no auth required). requestDemo enforces
 * proof-of-work and IP-based rate limiting to prevent abuse.
 */

import { GraphQLError } from "graphql";
import { randomBytes } from "crypto";
import builder from "../../../schema/builder";
import { logger } from "../../../logger";
import { assertProofOfWork } from "../../auth/helper";

// ---------------------------------------------------------------------------
// Input type
// ---------------------------------------------------------------------------

const RequestDemoInput = builder.inputType("RequestDemoInput", {
  fields: (t) => ({
    email: t.string({ required: true }),
    proof: t.string({ required: true }),
    hash: t.string({ required: true }),
  }),
});

// ---------------------------------------------------------------------------
// Rate-limit: one request per IP per 10 minutes
// ---------------------------------------------------------------------------

const REQUEST_RATE_LIMIT_PER_IP = 10 * 60 * 1000;

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

builder.queryField("getDemo", (t) =>
  t.prismaField({
    type: "DemoRequest",
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: (query, _root, args, ctx) =>
      ctx.prisma.demoRequest.findUniqueOrThrow({
        ...query,
        where: { id: args.id },
      }),
  }),
);

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

builder.mutationField("requestDemo", (t) =>
  t.prismaField({
    type: "DemoRequest",
    args: {
      input: t.arg({ type: RequestDemoInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const { email: rawEmail, hash, proof } = args.input;

      try {
        await assertProofOfWork(ctx.req.ip ?? "", hash, proof);
      } catch (error) {
        logger.warn(
          `requestDemo(...): Bad proof of work provided, email: ${rawEmail} IPs: ${ctx.req.ips},  IP: ${ctx.req.ip}`,
        );
        logger.error(error);
        throw new GraphQLError("Something went wrong, try again later", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const email = rawEmail.toLowerCase();

      // Return the existing demo request if one already exists for this email.
      const existingDemo = await ctx.prisma.demoRequest.findFirst({
        ...query,
        where: { email },
      });

      if (existingDemo) {
        return existingDemo;
      }

      // Reject if this IP already requested a demo in the past 10 minutes.
      const recentRequest = await ctx.prisma.demoRequest.findFirst({
        where: {
          ip_address: ctx.req.ip ?? "",
          createdAt: {
            gt: new Date(new Date().getTime() - REQUEST_RATE_LIMIT_PER_IP),
          },
        },
      });

      if (recentRequest) {
        throw new GraphQLError(
          "Rate limit reached, try again in a few minutes",
          { extensions: { code: "BAD_USER_INPUT" } },
        );
      }

      return ctx.prisma.demoRequest.create({
        ...query,
        data: {
          id: randomBytes(32).toString("hex"),
          email,
          ip_address: ctx.req.ip ?? "",
        },
      });
    },
  }),
);

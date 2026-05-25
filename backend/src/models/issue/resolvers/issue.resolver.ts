/**
 * Query resolvers for fetching Issues.
 *
 * Provides:
 *  - issue(id):           fetch an issue by ID (requires SUPPORT feature flag)
 *  - issueByToken(token): fetch an issue by public token (no auth required)
 *
 * The issue query requires hasRole auth + SUPPORT feature flag.
 * issueByToken is a public endpoint used by external users to view
 * their support case via the token URL.
 */

import { GraphQLError } from "graphql";
import { IssueActionCategory } from "@prisma/client";
import builder from "../../../schema/builder";
import { AuthRoleContext } from "../../../types";
import {
  FeatureFlags,
  assertFeatureFlag,
} from "../../../middlewares/featureFlag";

// ---------------------------------------------------------------------------
// issue query — fetch a single issue by ID (authed, feature-gated)
// ---------------------------------------------------------------------------

builder.queryField("issue", (t) =>
  t.prismaField({
    type: "Issue",
    authScopes: { hasRole: true },
    args: {
      id: t.arg.int({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;
      await assertFeatureFlag(me.organizationId, FeatureFlags.SUPPORT);

      const issue = await ctx.prisma.issue.findFirst({
        ...query,
        where: {
          id: args.id,
          organizationId: me.organizationId,
        },
      });

      if (!issue) {
        throw new GraphQLError(
          "This issue does not exist or has been deleted",
          { extensions: { code: "BAD_USER_INPUT" } },
        );
      }

      return issue;
    },
  }),
);

// ---------------------------------------------------------------------------
// issueByToken query — public endpoint for external support case access
//
// This is NOT an auth endpoint. Be mindful of what data is exposed.
// Only message-type actions and limited author fields are included.
// ---------------------------------------------------------------------------

builder.queryField("issueByToken", (t) =>
  t.prismaField({
    type: "Issue",
    args: {
      token: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const issue = await ctx.prisma.issue.findFirst({
        ...query,
        where: { token: args.token },
        include: {
          ...query.include,
          issueActions: {
            orderBy: { createdAt: "asc" },
            where: {
              category: {
                in: [
                  IssueActionCategory.CLIENT_MESSAGE,
                  IssueActionCategory.SUPPORT_MESSAGE,
                  IssueActionCategory.CLIENT_IMAGE,
                  IssueActionCategory.SUPPORT_IMAGE,
                  IssueActionCategory.AUTO_RESOLVED,
                ],
              },
            },
            include: {
              author: {
                select: {
                  id: true,
                  avatarUrl: true,
                  userId: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!issue) {
        throw new GraphQLError(
          "This issue does not exist or has been deleted",
          { extensions: { code: "BAD_USER_INPUT" } },
        );
      }

      return issue;
    },
  }),
);

/**
 * Mutation resolver for deleting an Issue.
 *
 * Provides:
 *  - deleteIssue(issueId): deletes an issue (ADMIN or OWNER only)
 *
 * Requires hasRole with ADMIN/OWNER + SUPPORT feature flag.
 */

import { RoleType } from "@prisma/client";
import builder from "../../../schema/builder";
import { AuthRoleContext } from "../../../types";
import {
  FeatureFlags,
  assertFeatureFlag,
} from "../../../middlewares/featureFlag";

builder.mutationField("deleteIssue", (t) =>
  t.prismaField({
    type: "Issue",
    authScopes: { hasRole: [RoleType.ADMIN, RoleType.OWNER] },
    args: {
      issueId: t.arg.int({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;
      await assertFeatureFlag(me.organizationId, FeatureFlags.SUPPORT);

      const issue = await ctx.prisma.issue.findFirstOrThrow({
        where: {
          id: args.issueId,
          organizationId: me.organizationId,
        },
      });

      return ctx.prisma.issue.delete({
        ...query,
        where: { id: issue.id },
      });
    },
  }),
);

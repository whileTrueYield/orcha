/**
 * Query resolver for fetching paginated Issues.
 *
 * Provides:
 *  - issues(first, last, offset, sort, search, productId, unread, unassigned,
 *           assigneeId, statuses): paginated issue list
 *
 * Delegates to getPaginatedIssues helper. Requires hasRole auth scope
 * and SUPPORT feature flag.
 */

import builder from "../../../schema/builder";
import { IssueStatusEnum } from "../../../schema/enums";
import { AuthRoleContext } from "../../../types";
import { PaginatedIssues } from "../entity";
import { getPaginatedIssues } from "../helper";
import {
  FeatureFlags,
  assertFeatureFlag,
} from "../../../middlewares/featureFlag";

builder.queryField("issues", (t) =>
  t.field({
    type: PaginatedIssues,
    authScopes: { hasRole: true },
    args: {
      first: t.arg.int({ required: false }),
      last: t.arg.int({ required: false }),
      offset: t.arg.int({ required: false }),
      sort: t.arg.string({ required: false }),
      search: t.arg.string({ required: false }),
      productId: t.arg.int({ required: false }),
      unread: t.arg.boolean({ required: false }),
      unassigned: t.arg.boolean({ required: false }),
      assigneeId: t.arg.int({ required: false }),
      statuses: t.arg({ type: [IssueStatusEnum], required: false }),
    },
    resolve: async (_root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;
      await assertFeatureFlag(me.organizationId, FeatureFlags.SUPPORT);

      return getPaginatedIssues({
        organizationId: me.organizationId,
        productId: args.productId ?? undefined,
        unread: args.unread ?? undefined,
        assigneeId: args.assigneeId ?? undefined,
        unassigned: args.unassigned ?? undefined,
        statuses: args.statuses ?? undefined,
        first: args.first ?? undefined,
        last: args.last ?? undefined,
        offset: args.offset ?? undefined,
        sort: args.sort as any,
        search: args.search ?? undefined,
      });
    },
  }),
);

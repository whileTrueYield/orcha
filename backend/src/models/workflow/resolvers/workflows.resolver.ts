/**
 * Query: workflows — paginated workflows list.
 */

import builder from "../../../schema/builder";
import { PaginatedWorkflows } from "../entity";
import { ModelStageEnum } from "../../../schema/enums";
import {
  getPaginatedWorkflows,
  getPaginatedWorkflowsForProduct,
} from "../helper";
import { AuthRoleContext } from "../../../types";

builder.queryField("workflows", (t) =>
  t.field({
    type: PaginatedWorkflows,
    authScopes: { hasRole: true },
    args: {
      first: t.arg.int({ required: false }),
      last: t.arg.int({ required: false }),
      offset: t.arg.int({ required: false }),
      sort: t.arg.string({ required: false }),
      search: t.arg.string({ required: false }),
      stages: t.arg({ type: [ModelStageEnum], required: false }),
      // When given, narrows to the workflows this product can attach to a ticket
      // (org defaults included) — the valid set createTicket validates against.
      productId: t.arg.int({ required: false }),
    },
    resolve: (_root, args, ctx) => {
      const organizationId = (ctx.me as AuthRoleContext).organizationId;
      if (args.productId != null) {
        return getPaginatedWorkflowsForProduct({
          productId: args.productId,
          organizationId,
          first: args.first ?? undefined,
          offset: args.offset ?? undefined,
          search: args.search ?? undefined,
        });
      }
      return getPaginatedWorkflows({
        organizationId,
        first: args.first ?? undefined,
        last: args.last ?? undefined,
        offset: args.offset ?? undefined,
        sort: (args.sort as any) ?? undefined,
        search: args.search ?? undefined,
        stages: args.stages ?? undefined,
      });
    },
  }),
);

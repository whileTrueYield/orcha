/**
 * Query resolver for listing Documentations (paginated).
 *
 * Registers: Query.documentations(...): PaginatedDocumentation
 *
 * Requires any linked role. Scoped to the caller's organisation.
 * Optionally filtered by stage(s).
 */

import { ModelStage } from "@prisma/client";
import builder from "../../../schema/builder";
import { ModelStageEnum } from "../../../schema/enums";
import { PaginatedDocumentations } from "../entity";
import { getPaginatedDocumentations } from "../helper";
import { AuthRoleContext } from "../../../types";

builder.queryField("documentations", (t) =>
  t.field({
    type: PaginatedDocumentations,
    authScopes: { hasRole: true },
    args: {
      first: t.arg.int({ required: false }),
      last: t.arg.int({ required: false }),
      offset: t.arg.int({ required: false }),
      sort: t.arg.string({ required: false }),
      search: t.arg.string({ required: false }),
      stages: t.arg({ type: [ModelStageEnum], required: false }),
    },
    resolve: (_root, args, ctx) =>
      getPaginatedDocumentations({
        organizationId: (ctx.me as AuthRoleContext).organizationId,
        first: args.first ?? undefined,
        last: args.last ?? undefined,
        offset: args.offset ?? undefined,
        sort: args.sort as any,
        search: args.search ?? undefined,
        stages: (args.stages as ModelStage[] | undefined) ?? undefined,
      }),
  }),
);

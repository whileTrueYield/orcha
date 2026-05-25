/**
 * Query resolver for fetching a Product by its short code.
 *
 * Registers: Query.productByCode(code: String!): Product!
 *
 * Requires any linked role. Scoped to the caller's organisation.
 */

import builder from "../../../schema/builder";
import { ProductRef } from "../entity";
import { AuthRoleContext } from "../../../types";

builder.queryField("productByCode", (t) =>
  t.prismaField({
    type: ProductRef,
    authScopes: { hasRole: true },
    args: {
      code: t.arg.string({ required: true }),
    },
    resolve: (query, _root, args, ctx) =>
      ctx.prisma.product.findFirstOrThrow({
        ...query,
        where: {
          code: args.code,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
        },
      }),
  }),
);

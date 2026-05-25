/**
 * Query resolver for fetching a single PersonalTag by ID.
 *
 * Registers: Query.personalTag(id: Int!): PersonalTag!
 *
 * Requires a linked role. Scoped to the caller's organisation
 * and owned by the caller's role.
 */

import builder from "../../../schema/builder";
import { PersonalTagRef } from "../entity";
import { AuthRoleContext } from "../../../types";

builder.queryField("personalTag", (t) =>
  t.prismaField({
    type: PersonalTagRef,
    authScopes: { hasRole: true },
    args: {
      id: t.arg.int({ required: true }),
    },
    resolve: (query, _root, args, ctx) =>
      ctx.prisma.personalTag.findFirstOrThrow({
        ...query,
        where: {
          id: args.id,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
          ownerId: (ctx.me as AuthRoleContext).roleId,
        },
      }),
  }),
);

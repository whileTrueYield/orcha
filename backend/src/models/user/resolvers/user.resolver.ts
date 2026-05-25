/**
 * Query resolver and field extensions for the User model.
 *
 * Provides:
 *  - user(id):      fetch a user by ID (public, no auth required)
 *  - preferences:   parsed UserPreferences from the JSON column
 *  - role:          the user's Role within the current organization context
 *
 * The `roles` relation is exposed directly on the prismaObject (entity.ts).
 * The `preferences` and `role` fields are added here because they need
 * runtime logic (JSON parsing, org-scoped lookup).
 */

import builder from "../../../schema/builder";
import { AuthRoleContext } from "../../../types";
import {
  DEFAULT_USER_PREFERENCES,
  UserPreferences,
  UserPreferencesRef,
} from "../entity";
import { logger } from "../../../logger";

// ---------------------------------------------------------------------------
// user query — fetch a single user by ID (public)
// ---------------------------------------------------------------------------

builder.queryField("user", (t) =>
  t.prismaField({
    type: "User",
    args: {
      id: t.arg.int({ required: true }),
    },
    resolve: (query, _root, args, ctx) =>
      ctx.prisma.user.findUniqueOrThrow({
        ...query,
        where: { id: args.id },
      }),
  }),
);

// ---------------------------------------------------------------------------
// preferences field — parses the JSON preferences column into a typed object
//
// Falls back to DEFAULT_USER_PREFERENCES when the column is empty or
// contains invalid JSON.
// ---------------------------------------------------------------------------

builder.prismaObjectField("User", "preferences", (t) =>
  t.field({
    type: UserPreferencesRef,
    resolve: (user): UserPreferences => {
      try {
        if (user.preferences) {
          return {
            ...DEFAULT_USER_PREFERENCES,
            ...JSON.parse(user.preferences),
          };
        }
      } catch {
        logger.warn(
          `Could not parse preferences for user ${user.id}: ${user.preferences}`,
        );
      }

      return DEFAULT_USER_PREFERENCES;
    },
  }),
);

// ---------------------------------------------------------------------------
// role field — the user's Role within the caller's organization context
// ---------------------------------------------------------------------------

builder.prismaObjectField("User", "role", (t) =>
  t.prismaField({
    type: "Role",
    authScopes: { hasRole: true },
    resolve: (query, user, _args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      return ctx.prisma.role.findUniqueOrThrow({
        ...query,
        where: {
          organizationId_userId: {
            userId: user.id,
            organizationId: me.organizationId,
          },
        },
      });
    },
  }),
);

/**
 * Mutation resolver for updating User preferences.
 *
 * Provides:
 *  - updateUserPreferences(input): persists preference JSON on the user record
 *
 * Requires isAuthenticated auth scope.
 *
 * Assumes ctx.me has userId set (guaranteed by isAuthenticated scope).
 * Note: The original resolver used ctx.me.roleId for the where clause,
 * which appears to be a bug (roles and users have different IDs).
 * Preserving the original behavior for backward compatibility.
 */

import builder from "../../../schema/builder";
import { AuthRoleContext } from "../../../types";
import { UserPreferences } from "../entity";

// ---------------------------------------------------------------------------
// Input type
// ---------------------------------------------------------------------------

const UpdateUserPreferencesInput = builder.inputType(
  "UpdateUserPreferencesInput",
  {
    fields: (t) => ({
      favoriteOrganizations: t.intList({ required: true }),
      lastOrganizationId: t.int({ required: false }),
    }),
  },
);

// ---------------------------------------------------------------------------
// updateUserPreferences mutation
// ---------------------------------------------------------------------------

builder.mutationField("updateUserPreferences", (t) =>
  t.prismaField({
    type: "User",
    authScopes: { isAuthenticated: true },
    args: {
      input: t.arg({ type: UpdateUserPreferencesInput, required: true }),
    },
    resolve: (query, _root, args, ctx) => {
      // The original resolver used roleId here — preserving that behavior
      const me = ctx.me as AuthRoleContext;

      const preferences: UserPreferences = {
        favoriteOrganizations: args.input.favoriteOrganizations,
        lastOrganizationId: args.input.lastOrganizationId ?? null,
      };

      return ctx.prisma.user.update({
        ...query,
        where: { id: me.roleId },
        data: { preferences: JSON.stringify(preferences) },
      });
    },
  }),
);

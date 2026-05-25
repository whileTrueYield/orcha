/**
 * Mutation resolver for updating Organisation preferences.
 *
 * Registers: Mutation.updateOrganizationPreferences(input): Organization!
 *
 * Requires ADMIN or OWNER role. Serialises the preferences to JSON
 * and stores them in the `preferences` column.
 */

import builder from "../../../schema/builder";
import { OrganizationRef, OrganizationPreferencesShape } from "../entity";
import { AuthRoleContext } from "../../../types";

// ---------------------------------------------------------------------------
// Input type
// ---------------------------------------------------------------------------

const UpdateOrganizationPreferencesInput = builder.inputType(
  "UpdateOrganizationPreferencesInput",
  {
    fields: (t) => ({
      showOnboarding: t.boolean({ required: true }),
    }),
  },
);

// ---------------------------------------------------------------------------
// Mutation
// ---------------------------------------------------------------------------

builder.mutationField("updateOrganizationPreferences", (t) =>
  t.prismaField({
    type: OrganizationRef,
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      input: t.arg({
        type: UpdateOrganizationPreferencesInput,
        required: true,
      }),
    },
    resolve: async (query, _root, args, ctx) => {
      const preferences: OrganizationPreferencesShape = {
        showOnboarding: args.input.showOnboarding,
      };

      return ctx.prisma.organization.update({
        ...query,
        where: { id: (ctx.me as AuthRoleContext).roleId },
        data: { preferences: JSON.stringify(preferences) },
      });
    },
  }),
);

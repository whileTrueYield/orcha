/**
 * Pothos type definitions for the User model.
 *
 * password is NOT exposed in the prismaObject (security).
 * preferences is exposed as a typed UserPreferences object via a
 * computed field resolver in user.resolver.ts (parses the raw JSON
 * column into a structured type).
 *
 * Exports:
 *  - UserRef:             prismaObject for User (excludes password)
 *  - UserPreferencesRef:  plain objectRef for the parsed preferences shape
 *  - PaginatedUsers:      paginated wrapper via createPaginatedType
 *  - DEFAULT_USER_PREFERENCES: fallback when preferences JSON is absent/invalid
 *  - UserPreferences:     TS interface for the preferences shape
 *  - userStatuses:        convenience array of all UserStatus values
 */

import { UserStatus } from "@prisma/client";
import builder from "../../schema/builder";
import { createPaginatedType } from "../../schema/pagination";
import { UserStatusEnum } from "../../schema/enums";

// ---------------------------------------------------------------------------
// UserPreferences — plain TS interface + GraphQL object type
// ---------------------------------------------------------------------------

export interface UserPreferences {
  favoriteOrganizations: number[];
  lastOrganizationId: number | null;
}

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  favoriteOrganizations: [],
  lastOrganizationId: null,
};

export const UserPreferencesRef =
  builder.objectRef<UserPreferences>("UserPreferences");

builder.objectType(UserPreferencesRef, {
  fields: (t) => ({
    favoriteOrganizations: t.exposeIntList("favoriteOrganizations"),
    lastOrganizationId: t.exposeInt("lastOrganizationId", { nullable: true }),
  }),
});

// ---------------------------------------------------------------------------
// User — prismaObject backed by the Prisma User model
//
// password is intentionally omitted — never exposed over the API.
// preferences is exposed as a computed field in user.resolver.ts
// (returns a typed UserPreferences object instead of the raw JSON string).
// ---------------------------------------------------------------------------

export const UserRef = builder.prismaObject("User", {
  fields: (t) => ({
    id: t.exposeInt("id"),
    email: t.exposeString("email"),
    isStaff: t.exposeBoolean("isStaff"),
    status: t.expose("status", { type: UserStatusEnum }),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
    roles: t.relation("roles"),
  }),
});

// ---------------------------------------------------------------------------
// PaginatedUsers — standard paginated wrapper
// ---------------------------------------------------------------------------

export const PaginatedUsers = createPaginatedType("Users", UserRef);

export const userStatuses = Object.values(UserStatus);

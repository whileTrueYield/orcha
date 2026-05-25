/**
 * Auth Pothos type registrations — the `Me` object and AuthStatus enum.
 *
 * `Me` is a composite type representing the current session state:
 *   - GUEST:  no authenticated user
 *   - USER:   authenticated but not linked to an organization
 *   - LINKED: authenticated + organization + role
 *
 * It is not backed by a single Prisma model, so we use objectRef.
 *
 * Exports: MeRef, AuthStatusEnum.
 *
 * Assumes User, Organization, and Role Prisma objects are (or will be)
 * registered on the builder before schema materialisation.
 */

import {
  User as PrismaUser,
  Organization as PrismaOrganization,
  Role as PrismaRole,
} from "@prisma/client";
import builder from "../../schema/builder";
import { AuthStatus } from "../../types";
import { RoleRef } from "../role/entity";
import { OrganizationRef } from "../organization/entity";
import { UserRef } from "../user/entity";

// ---------------------------------------------------------------------------
// AuthStatus enum — non-Prisma, defined in src/types.ts
// ---------------------------------------------------------------------------

export const AuthStatusEnum = builder.enumType(AuthStatus, {
  name: "AuthStatus",
});

// ---------------------------------------------------------------------------
// Me shape — plain TS interface replacing the decorated class
// ---------------------------------------------------------------------------

export interface MeShape {
  role?: PrismaRole;
  organization?: PrismaOrganization;
  user?: PrismaUser;
  status: AuthStatus;
}

// ---------------------------------------------------------------------------
// Me GraphQL object
//
// The nested Prisma models (role, user, organization) are exposed as nullable
// fields. We reference them via builder.objectRef with string names so the
// actual prismaObject definitions can live in their own model modules.
// ---------------------------------------------------------------------------

export const MeRef = builder.objectRef<MeShape>("Me");

builder.objectType(MeRef, {
  fields: (t) => ({
    status: t.field({
      type: AuthStatusEnum,
      resolve: (parent) => parent.status,
    }),

    role: t.field({
      type: RoleRef,
      nullable: true,
      resolve: (parent) => parent.role ?? null,
    }),
    organization: t.field({
      type: OrganizationRef,
      nullable: true,
      resolve: (parent) => parent.organization ?? null,
    }),
    user: t.field({
      type: UserRef,
      nullable: true,
      resolve: (parent) => parent.user ?? null,
    }),
  }),
});

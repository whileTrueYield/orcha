/**
 * Pothos SchemaBuilder — single source of truth for GraphQL schema construction.
 *
 * Configures three plugins:
 *  - PrismaPlugin:       auto-generates types from the Prisma schema
 *  - ScopeAuthPlugin:    declarative auth scopes (isAuthenticated, hasRole, isStaff)
 *  - SimpleObjectsPlugin: lightweight object types without a backing model
 *
 * Every resolver file imports `builder` from here, adds its types/queries/mutations,
 * and the final schema is materialised via `builder.toSchema()` in the entry point.
 *
 * Auth scopes mirror the three levels from the legacy TypeGraphQL middlewares:
 *  - isAuthenticated: the session belongs to a real user (not a guest)
 *  - hasRole:         the user is linked to an organization (optionally with a specific RoleType)
 *  - isStaff:         the user record has isStaff === true (requires a DB lookup)
 */

import SchemaBuilder from "@pothos/core";
import PrismaPlugin from "@pothos/plugin-prisma";
import ScopeAuthPlugin from "@pothos/plugin-scope-auth";
import SimpleObjectsPlugin from "@pothos/plugin-simple-objects";
import { GraphQLError } from "graphql";
import { DateTimeResolver } from "graphql-scalars";
import { RoleType } from "@prisma/client";
import type PrismaTypes from "../generated/pothos-types";
import { getDatamodel } from "../generated/pothos-types";
import prisma from "../prisma";
import { AppContext, AuthContext, AuthStatus } from "../types";

// ---------------------------------------------------------------------------
// Scope type definitions
// ---------------------------------------------------------------------------

interface AuthScopes {
  isAuthenticated: boolean;
  hasRole: boolean | RoleType | RoleType[];
  isStaff: boolean;
}

// ---------------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------------

const builder = new SchemaBuilder<{
  PrismaTypes: PrismaTypes;
  Context: AppContext<AuthContext>;
  AuthScopes: AuthScopes;
  DefaultFieldNullability: false;
  Scalars: {
    ID: { Input: string; Output: string | number };
    DateTime: { Input: Date; Output: Date };
  };
}>({
  defaultFieldNullability: false,
  plugins: [ScopeAuthPlugin, PrismaPlugin, SimpleObjectsPlugin],

  prisma: {
    client: (_ctx: AppContext<AuthContext>) => prisma,
    dmmf: getDatamodel(),
  },

  scopeAuth: {
    // When no scopes are specified on a field, default to public (no auth required).
    // Individual fields/types opt-in to protection via authScopes.
    authorizeOnSubscribe: false,
    defaultStrategy: "any",

    authScopes: async (context: AppContext<AuthContext>) => ({
    // -----------------------------------------------------------------------
    // isAuthenticated — user has a session (anything beyond GUEST)
    // -----------------------------------------------------------------------
    isAuthenticated: context.me.status !== AuthStatus.GUEST,

    // -----------------------------------------------------------------------
    // hasRole — user is linked to an organization with an (optional) role
    //
    // Accepts:
    //   true          → any linked role
    //   RoleType      → must match exactly
    //   RoleType[]    → must be one of the listed roles
    // -----------------------------------------------------------------------
    hasRole: (requiredRole: boolean | RoleType | RoleType[]) => {
      if (context.me.status !== AuthStatus.LINKED) {
        throw new GraphQLError("You do not appear to be connected", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      // `true` means "any role as long as you're linked"
      if (requiredRole === true) return true;

      const roles = Array.isArray(requiredRole)
        ? requiredRole
        : [requiredRole as RoleType];

      if (roles.length === 0) return true;

      if (!roles.includes(context.me.roleType)) {
        const label = roles.map((r) => r.toLowerCase()).join(" or ");
        throw new GraphQLError(`Your role needs to be ${label}`, {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      return true;
    },

    // -----------------------------------------------------------------------
    // isStaff — requires a DB lookup on the User record
    // -----------------------------------------------------------------------
    isStaff: async () => {
      if (context.me.status === AuthStatus.GUEST) {
        throw new GraphQLError("Access denied", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const user = await prisma.user.findUniqueOrThrow({
        where: { id: context.me.userId },
      });

      if (!user.isStaff) {
        throw new GraphQLError("You need to be a staff member", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      return true;
    },
  }),
  },
});

// ---------------------------------------------------------------------------
// Scalar registration — DateTime uses the standard ISO-8601 resolver from
// graphql-scalars, matching the behaviour of the previous TypeGraphQL stack.
// ---------------------------------------------------------------------------

builder.addScalarType("DateTime", DateTimeResolver);

export default builder;

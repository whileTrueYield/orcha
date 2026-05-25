/**
 * Authentication and authorisation helpers.
 *
 * These are plain functions (not TypeGraphQL middleware classes) used by:
 *  - The Pothos scope-auth plugin (in schema/builder.ts)
 *  - Direct calls from resolver logic where finer-grained checks are needed
 *
 * The old MeContextMiddleware logic has moved into the Apollo v4 context
 * factory in server.ts.
 *
 * Exports: isAuthenticated, hasRole, isStaff, buildMeContext.
 */

import { GraphQLError } from "graphql";
import { RoleType, Role, User, Organization } from "@prisma/client";
import { isArray, isEmpty, toLower } from "lodash";
import { AppContext, AuthContext, AuthStatus } from "../types";
import prisma from "../prisma";
import { Request } from "express";
import { Session } from "express-session";

// ---------------------------------------------------------------------------
// isAuthenticated — throws if the caller is a guest
// ---------------------------------------------------------------------------

export function assertAuthenticated(context: AppContext<AuthContext>): void {
  if (context.me.status === AuthStatus.GUEST) {
    throw new GraphQLError("You need to be authenticated", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
}

// ---------------------------------------------------------------------------
// hasRole — throws if the caller is not linked or lacks the required role(s)
// ---------------------------------------------------------------------------

export function assertHasRole(
  context: AppContext<AuthContext>,
  roles?: RoleType[] | RoleType,
): void {
  // A role only makes sense when the user is linked to an organization
  if (context.me.status !== AuthStatus.LINKED) {
    throw new GraphQLError("You do not appear to be connected", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  if (!roles || (isArray(roles) && isEmpty(roles))) {
    return;
  }

  const normalized = isArray(roles)
    ? roles.length === 1
      ? roles[0]
      : roles
    : roles;

  if (isArray(normalized)) {
    if (!normalized.includes(context.me.roleType)) {
      throw new GraphQLError(
        `Your role needs to be ${normalized.map(toLower).join(" or ")}`,
        { extensions: { code: "UNAUTHENTICATED" } },
      );
    }
  } else if (normalized !== context.me.roleType) {
    throw new GraphQLError(
      `Only the ${toLower(normalized)} role can perform this action.`,
      { extensions: { code: "UNAUTHENTICATED" } },
    );
  }
}

// ---------------------------------------------------------------------------
// isStaff — throws if the caller is not a staff member
// ---------------------------------------------------------------------------

export async function assertIsStaff(
  context: AppContext<AuthContext>,
): Promise<void> {
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
}

// ---------------------------------------------------------------------------
// buildMeContext — constructs the `me` portion of AppContext from a session.
//
// Extracted from the old MeContextMiddleware class so that the Apollo v4
// context factory can call it synchronously.
// ---------------------------------------------------------------------------

export function buildMeContext(
  req: Request & { session: Session },
): AuthContext {
  const userId = req.session.userId;
  const roleId = req.session.roleId;
  const organizationId = req.session.organizationId;
  const roleType = req.session.roleType;

  const getUser = async (): Promise<User> =>
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { roles: true },
    });

  const getOrganization = async (): Promise<Organization> =>
    prisma.organization.findUniqueOrThrow({
      where: { id: organizationId },
    });

  const getRole = async (): Promise<Role> =>
    prisma.role.findUniqueOrThrow({
      where: { id: roleId },
      include: { teams: true },
    });

  if (userId && roleType && roleId && organizationId) {
    return {
      userId,
      roleId,
      organizationId,
      status: AuthStatus.LINKED,
      roleType,
      getUser,
      getRole,
      getOrganization,
    };
  }

  if (userId) {
    return {
      userId,
      getUser,
      status: AuthStatus.USER,
    };
  }

  return { status: AuthStatus.GUEST };
}

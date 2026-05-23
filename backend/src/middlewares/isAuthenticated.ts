import {
  MiddlewareFn,
  MiddlewareInterface,
  NextFn,
  ResolverData,
} from "type-graphql";
import { AppContext, AuthStatus, AuthContext } from "../types";
import { AuthenticationError } from "apollo-server-express";
import { RoleType, Role, User, Organization } from "@prisma/client";
import { get, isArray, isEmpty, toLower } from "lodash";

export const isAuthenticated: MiddlewareFn<AppContext<AuthContext>> = async (
  { context },
  next
) => {
  if (context.me.status === AuthStatus.GUEST) {
    throw new AuthenticationError("You need to be authenticated");
  }

  return next();
};

export class MeContextMiddleware
  implements MiddlewareInterface<AppContext<AuthContext>>
{
  async use({ context }: ResolverData<AppContext<AuthContext>>, next: NextFn) {
    const organizationId = get(context, "req.session.organizationId");
    const roleId = get(context, "req.session.roleId");
    const userId = get(context, "req.session.userId");
    const roleType = get(context, "req.session.roleType");

    const getUser = async (): Promise<User> =>
      context.prisma.user.findUniqueOrThrow({
        where: { id: userId },
        include: { roles: true },
      });

    const getOrganization = async (): Promise<Organization> =>
      context.prisma.organization.findUniqueOrThrow({
        where: { id: organizationId },
      });

    const getRole = async (): Promise<Role> =>
      context.prisma.role.findUniqueOrThrow({
        where: { id: roleId },
        include: { teams: true },
      });

    if (userId && roleType && roleId && organizationId) {
      context.me = {
        userId,
        roleId,
        organizationId,
        status: AuthStatus.LINKED,
        roleType,
        getUser,
        getRole,
        getOrganization,
      };
    } else if (userId) {
      context.me = {
        userId,
        getUser,
        status: AuthStatus.USER,
      };
    } else {
      context.me = { status: AuthStatus.GUEST };
    }

    return next();
  }
}

export class StaffOnly implements MiddlewareInterface<AppContext<AuthContext>> {
  async use({ context }: ResolverData<AppContext<AuthContext>>, next: NextFn) {
    if (context.me.status === AuthStatus.GUEST) {
      throw new AuthenticationError("Access denied");
    }
    const user = await context.prisma.user.findUniqueOrThrow({
      where: { id: context.me.userId },
    });

    if (user.isStaff) {
      return next();
    }

    throw new AuthenticationError("Access denied");
  }
}

export const isStaff: MiddlewareFn<AppContext<AuthContext>> = async (
  { context },
  next
) => {
  if (get(context, "me.user.isStaff") !== true) {
    throw new AuthenticationError("You need to be a staff member");
  }

  return next();
};

export const hasRole =
  (roles?: RoleType[] | RoleType): MiddlewareFn<AppContext<AuthContext>> =>
  async ({ context }, next) => {
    // if you need a role, your auth status should be linked (to an organization)
    // because the concept of role is only relevant within an organization
    if (context.me.status !== AuthStatus.LINKED) {
      throw new AuthenticationError("You do not appear to be connected");
    } else if (!roles) {
      // if there is no role restriction defined but the authStatus is linked
      return next();
    }

    if (isEmpty(roles)) {
      return next();
    }

    if (isArray(roles) && roles.length === 1) {
      roles = roles[0];
    }

    if (isArray(roles)) {
      // if a set of roles have been set we'll check that the user is a match
      if (roles.indexOf(context.me.roleType) === -1) {
        throw new AuthenticationError(
          `Your role needs to be ${roles.map(toLower).join(" or ")}`
        );
      }
    } else if (roles !== context.me.roleType) {
      throw new AuthenticationError(
        `Only the ${toLower(roles)} role can perform this action.`
      );
    }

    // otherwise we're good to go
    return next();
  };

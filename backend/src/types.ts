import { Request, Response } from "express";
import { User, Organization, Role, RoleType } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import { Session } from "express-session";
declare module "express-session" {
  interface SessionData {
    userId?: number;
    organizationId?: number;
    roles: Role[];
    roleId?: number;
    roleType?: RoleType;
    isStaff?: boolean;
  }
}

export enum AuthStatus {
  GUEST = "GUEST",
  USER = "USER",
  LINKED = "LINKED", // user with a role
}

export interface GuestUserContext {
  status: AuthStatus.GUEST; // user with a role
}

export interface AuthUserContext {
  status: AuthStatus.USER; // user with a role
  userId: number;
  getUser: () => Promise<User>;
}

export interface AuthRoleContext {
  userId: number;
  roleId: number;
  roleType: RoleType;
  organizationId: number;
  status: AuthStatus.LINKED; // user with a role
  getRole: () => Promise<Role>;
  getUser: () => Promise<User>;
  getOrganization: () => Promise<Organization>;
}

export type AuthContext = GuestUserContext | AuthRoleContext | AuthUserContext;

export interface AppContext<Me extends AuthContext> {
  req: Request & { session: Session };
  res: Response;
  me: Me;
  prisma: PrismaClient;
}

export type UserSession = UserOnlySession | UserLinkedSession;

export interface UserOnlySession {
  userId?: number;
}

export interface UserLinkedSession {
  userId: number;
  roleId: number;
  organizationId: number;
  roleType: RoleType;
}

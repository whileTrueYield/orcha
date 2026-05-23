import { RoleType } from "@prisma/client";
import { AuthRoleContext } from "../types";

export const isOwnerLevel = (role: RoleType): boolean => {
  return role === RoleType.OWNER;
};

export const isAdminLevel = (role: RoleType): boolean => {
  return role === RoleType.ADMIN;
};

export const isMemberLevel = (role: RoleType): boolean => {
  return role === RoleType.MEMBER;
};

export const isVisitorLevel = (role: RoleType): boolean => {
  return role === RoleType.VISITOR;
};

export const isAtLeastAdminLevel = (role: RoleType): boolean => {
  return isAdminLevel(role) || isOwnerLevel(role);
};

export const isAtLeastMemberLevel = (role: RoleType): boolean => {
  return isMemberLevel(role) || isAtLeastAdminLevel(role);
};

export const isAtLeastVisitorLevel = (role: RoleType): boolean => {
  return isVisitorLevel(role) || isAtLeastMemberLevel(role);
};

export const isAuthorOrAdmin = (
  roleCtx: AuthRoleContext,
  authorId: number
): boolean =>
  authorId === roleCtx.roleId || isAtLeastAdminLevel(roleCtx.roleType);

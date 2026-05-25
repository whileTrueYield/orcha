import { Drawing, Role } from "@prisma/client";

/**
 * Check if a drawing can be locked by a given roleId
 * @returns boolean
 */
export const canLockDrawing = (
  drawing: Drawing & { role: Role | null },
  roleId: number
): boolean => {
  if (drawing.role && drawing.lockExpiration) {
    // current lock owner can re-lock
    if (drawing.role.id === roleId) {
      return true;
    }

    // you can lock if the lock expired
    if (drawing.lockExpiration < new Date()) {
      return true;
    }

    return false;
  }

  // no apparent lock
  return true;
};

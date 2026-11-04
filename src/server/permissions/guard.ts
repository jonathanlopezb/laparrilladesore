/**
 * src/server/permissions/guard.ts
 * Guards de autorización para Route Handlers y Server Actions.
 * Lanza excepciones tipadas en lugar de retornar null.
 */
import "server-only";
import { type Permission, hasPermission, type Role } from "./matrix";

export class AuthError extends Error {
  readonly status: 401 | 403;
  constructor(message: string, status: 401 | 403 = 401) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

export interface SessionUser {
  id: string;
  role: Role;
  branchIds: string[];
}

/**
 * Lanza AuthError(403) si el usuario no tiene el permiso indicado.
 * Usar en Route Handlers y Server Actions DESPUÉS de verificar sesión.
 */
export function requirePermission(
  user: SessionUser,
  permission: Permission
): void {
  if (!hasPermission(user.role, permission)) {
    throw new AuthError(
      `El rol ${user.role} no tiene permiso: ${permission}`,
      403
    );
  }
}

/**
 * Verifica que el usuario tenga acceso a la sucursal solicitada.
 * ADMIN puede acceder a cualquier sucursal (si se amplía a multi-sede).
 */
export function requireBranchAccess(
  user: SessionUser,
  branchId: string
): void {
  if (user.role === "ADMIN") return; // admin accede a todas
  if (!user.branchIds.includes(branchId)) {
    throw new AuthError(
      `Sin acceso a la sucursal ${branchId}`,
      403
    );
  }
}

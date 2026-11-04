/**
 * src/server/permissions/matrix.ts
 * Matriz de permisos del servidor.
 * REGLA: nunca usar `role === X` directamente en componentes.
 * Siempre consultar esta matriz desde el servidor.
 */

export type Role = "ADMIN" | "SELLER" | "ACCOUNTANT";

export type Permission =
  // Dashboard
  | "dashboard.read.own"
  | "dashboard.read.all"
  // Orders
  | "orders.create"
  | "orders.read.own"
  | "orders.read.branch"
  | "orders.update_status"
  | "orders.cancel"
  | "orders.discount"
  | "orders.refund"
  // Menu
  | "menu.read"
  | "menu.manage"
  | "recipes.manage"
  // Inventory
  | "inventory.read"
  | "inventory.receive"
  | "inventory.adjust"
  | "inventory.waste"
  | "inventory.count.approve"
  // Suppliers / Purchases
  | "suppliers.read"
  | "suppliers.manage"
  | "purchases.create"
  | "purchases.receive"
  | "payables.read"
  | "payables.pay"
  // Cash
  | "cash.open"
  | "cash.read.own"
  | "cash.read.all"
  | "cash.movement.create"
  | "cash.close"
  | "cash.close.approve"
  // Expenses
  | "expenses.create"
  | "expenses.approve"
  // Reports
  | "reports.sales"
  | "reports.financial"
  // Admin
  | "users.manage"
  | "settings.manage"
  | "audit.read";

const ADMIN_PERMISSIONS = new Set<Permission>([
  "dashboard.read.own",
  "dashboard.read.all",
  "orders.create",
  "orders.read.own",
  "orders.read.branch",
  "orders.update_status",
  "orders.cancel",
  "orders.discount",
  "orders.refund",
  "menu.read",
  "menu.manage",
  "recipes.manage",
  "inventory.read",
  "inventory.receive",
  "inventory.adjust",
  "inventory.waste",
  "inventory.count.approve",
  "suppliers.read",
  "suppliers.manage",
  "purchases.create",
  "purchases.receive",
  "payables.read",
  "payables.pay",
  "cash.open",
  "cash.read.own",
  "cash.read.all",
  "cash.movement.create",
  "cash.close",
  "cash.close.approve",
  "expenses.create",
  "expenses.approve",
  "reports.sales",
  "reports.financial",
  "users.manage",
  "settings.manage",
  "audit.read",
]);

const SELLER_PERMISSIONS = new Set<Permission>([
  "dashboard.read.own",
  "orders.create",
  "orders.read.own",
  "orders.update_status",
  "menu.read",
  "inventory.read",
  "cash.open",
  "cash.read.own",
  "cash.movement.create",
  "cash.close",
  "reports.sales",
]);

const ACCOUNTANT_PERMISSIONS = new Set<Permission>([
  "dashboard.read.own",
  "dashboard.read.all",
  "orders.read.branch",
  "menu.read",
  "inventory.read",
  "suppliers.read",
  "purchases.create",
  "purchases.receive",
  "payables.read",
  "payables.pay",
  "cash.read.all",
  "cash.close.approve",
  "expenses.create",
  "expenses.approve",
  "reports.sales",
  "reports.financial",
  "audit.read",
]);

const ROLE_PERMISSIONS: Record<Role, Set<Permission>> = {
  ADMIN: ADMIN_PERMISSIONS,
  SELLER: SELLER_PERMISSIONS,
  ACCOUNTANT: ACCOUNTANT_PERMISSIONS,
};

/** Verifica si un rol tiene un permiso específico */
export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.has(permission) ?? false;
}

/** Retorna todos los permisos de un rol */
export function getPermissions(role: Role): Set<Permission> {
  return ROLE_PERMISSIONS[role] ?? new Set();
}

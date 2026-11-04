/**
 * tests/unit/permissions.test.ts
 * Tests unitarios para la matriz de permisos.
 */
import { describe, it, expect } from "vitest";
import { hasPermission, getPermissions } from "@/server/permissions/matrix";

describe("hasPermission - ADMIN", () => {
  it("tiene dashboard.read.all", () => {
    expect(hasPermission("ADMIN", "dashboard.read.all")).toBe(true);
  });
  it("tiene users.manage", () => {
    expect(hasPermission("ADMIN", "users.manage")).toBe(true);
  });
  it("tiene orders.cancel", () => {
    expect(hasPermission("ADMIN", "orders.cancel")).toBe(true);
  });
});

describe("hasPermission - SELLER", () => {
  it("puede crear pedidos", () => {
    expect(hasPermission("SELLER", "orders.create")).toBe(true);
  });
  it("NO puede ver costos/reportes financieros", () => {
    expect(hasPermission("SELLER", "reports.financial")).toBe(false);
  });
  it("NO puede gestionar usuarios", () => {
    expect(hasPermission("SELLER", "users.manage")).toBe(false);
  });
  it("NO puede anular pedidos", () => {
    expect(hasPermission("SELLER", "orders.cancel")).toBe(false);
  });
  it("NO puede ver proveedores", () => {
    expect(hasPermission("SELLER", "suppliers.read")).toBe(false);
  });
  it("NO puede ajustar inventario", () => {
    expect(hasPermission("SELLER", "inventory.adjust")).toBe(false);
  });
});

describe("hasPermission - ACCOUNTANT", () => {
  it("puede ver reportes financieros", () => {
    expect(hasPermission("ACCOUNTANT", "reports.financial")).toBe(true);
  });
  it("puede pagar a proveedores", () => {
    expect(hasPermission("ACCOUNTANT", "payables.pay")).toBe(true);
  });
  it("NO puede gestionar usuarios", () => {
    expect(hasPermission("ACCOUNTANT", "users.manage")).toBe(false);
  });
  it("NO puede cambiar configuración", () => {
    expect(hasPermission("ACCOUNTANT", "settings.manage")).toBe(false);
  });
  it("NO puede crear pedidos", () => {
    expect(hasPermission("ACCOUNTANT", "orders.create")).toBe(false);
  });
});

describe("getPermissions", () => {
  it("ADMIN tiene más permisos que SELLER", () => {
    const admin = getPermissions("ADMIN");
    const seller = getPermissions("SELLER");
    expect(admin.size).toBeGreaterThan(seller.size);
  });
});

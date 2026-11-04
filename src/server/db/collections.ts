/**
 * src/server/db/collections.ts
 * Typed collection accessors — server-only.
 * Centraliza el acceso a colecciones y evita strings dispersos.
 */
import "server-only";
import type { Collection } from "mongodb";
import { getDb } from "./client";
import type {
  UserDoc,
  SessionDoc,
  BranchDoc,
  CategoryDoc,
  ProductDoc,
  IngredientDoc,
  RecipeDoc,
  InventoryBalanceDoc,
  StockMovementDoc,
  OrderDoc,
  PaymentDoc,
  CashSessionDoc,
  CashMovementDoc,
  SupplierDoc,
  PurchaseDoc,
  SupplierPaymentDoc,
  ExpenseDoc,
  CustomerDoc,
  AuditLogDoc,
  CounterDoc,
  SettingsDoc,
} from "@/shared/types/collections";

// Helper genérico
async function col<T extends object>(name: string): Promise<Collection<T>> {
  const db = await getDb();
  return db.collection<T>(name);
}

export const collections = {
  users: () => col<UserDoc>("user"),
  sessions: () => col<SessionDoc>("session"),
  branches: () => col<BranchDoc>("branches"),
  categories: () => col<CategoryDoc>("categories"),
  products: () => col<ProductDoc>("products"),
  ingredients: () => col<IngredientDoc>("ingredients"),
  recipes: () => col<RecipeDoc>("recipes"),
  inventoryBalances: () => col<InventoryBalanceDoc>("inventory_balances"),
  stockMovements: () => col<StockMovementDoc>("stock_movements"),
  orders: () => col<OrderDoc>("orders"),
  payments: () => col<PaymentDoc>("payments"),
  cashSessions: () => col<CashSessionDoc>("cash_sessions"),
  cashMovements: () => col<CashMovementDoc>("cash_movements"),
  suppliers: () => col<SupplierDoc>("suppliers"),
  purchases: () => col<PurchaseDoc>("purchases"),
  supplierPayments: () => col<SupplierPaymentDoc>("supplier_payments"),
  expenses: () => col<ExpenseDoc>("expenses"),
  customers: () => col<CustomerDoc>("customers"),
  auditLogs: () => col<AuditLogDoc>("audit_logs"),
  counters: () => col<CounterDoc>("counters"),
  settings: () => col<SettingsDoc>("settings"),
} as const;

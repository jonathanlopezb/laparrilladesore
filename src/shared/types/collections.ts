/**
 * src/shared/types/collections.ts
 * Tipos TypeScript para cada colección MongoDB.
 * No dependen del driver (no importan ObjectId directamente en la interfaz pública).
 */
import type { ObjectId } from "mongodb";

// ─── Comunes ─────────────────────────────────────────────────────────────────

export interface TimestampedDoc {
  createdAt: Date;
  updatedAt: Date;
}

export interface BranchScopedDoc extends TimestampedDoc {
  branchId: ObjectId;
}

// ─── Auth (Better Auth) ───────────────────────────────────────────────────────

export interface UserDoc {
  _id: ObjectId;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  role: "ADMIN" | "SELLER" | "ACCOUNTANT";
  branchIds: ObjectId[];
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionDoc {
  _id: ObjectId;
  userId: ObjectId;
  token: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Negocio ──────────────────────────────────────────────────────────────────

export interface BranchDoc extends TimestampedDoc {
  _id: ObjectId;
  name: string;
  timezone: string; // "America/Bogota"
  currency: string; // "COP"
  isActive: boolean;
}

export interface CategoryDoc extends BranchScopedDoc {
  _id: ObjectId;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  createdBy: ObjectId;
}

export interface ProductDoc extends BranchScopedDoc {
  _id: ObjectId;
  sku: string;
  name: string;
  slug: string;
  categoryId: ObjectId;
  description?: string;
  priceCOP: number; // entero, pesos colombianos
  imageUrl?: string;
  isActive: boolean;
  isAvailable: boolean;
  recipeId?: ObjectId;
  sortOrder: number;
  createdBy: ObjectId;
}

export interface IngredientDoc extends BranchScopedDoc {
  _id: ObjectId;
  sku: string;
  name: string;
  group?: string;
  baseUnit: "g" | "ml" | "unit";
  reorderThreshold: number;
  averageCostCOP: number; // entero COP por baseUnit
  isActive: boolean;
  createdBy: ObjectId;
}

export interface RecipeLineItem {
  ingredientId: ObjectId;
  quantity: number; // en baseUnit del ingrediente
  wasteFactorPct?: number; // porcentaje merma 0-100
}

export interface RecipeDoc extends BranchScopedDoc {
  _id: ObjectId;
  productId: ObjectId;
  version: number;
  lines: RecipeLineItem[];
  isActive: boolean;
  createdBy: ObjectId;
}

export interface InventoryBalanceDoc {
  _id: ObjectId;
  branchId: ObjectId;
  ingredientId: ObjectId;
  quantityOnHand: number; // en baseUnit
  updatedAt: Date;
}

export type StockMovementType =
  | "OPENING"
  | "PURCHASE_RECEIPT"
  | "SALE_CONSUMPTION"
  | "WASTE"
  | "ADJUSTMENT_IN"
  | "ADJUSTMENT_OUT"
  | "CUSTOMER_RETURN"
  | "SUPPLIER_RETURN"
  | "REVERSAL";

export interface StockMovementDoc extends BranchScopedDoc {
  _id: ObjectId;
  ingredientId: ObjectId;
  movementType: StockMovementType;
  quantity: number; // positivo = entrada, negativo = salida
  unitCostCOP?: number;
  sourceType?: string; // "order" | "purchase" | "adjustment" | ...
  sourceId?: ObjectId;
  sourceLineId?: ObjectId;
  reason?: string;
  createdBy: ObjectId;
}

export type OrderStatus =
  | "DRAFT"
  | "CONFIRMED"
  | "IN_PREPARATION"
  | "READY"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentStatus =
  | "UNPAID"
  | "PARTIALLY_PAID"
  | "PAID"
  | "PARTIALLY_REFUNDED"
  | "REFUNDED";

export type OrderChannel = "counter" | "takeaway" | "table" | "delivery";

export interface OrderLineItem {
  productId: ObjectId;
  productSnapshot: {
    name: string;
    sku: string;
    priceCOP: number;
    description?: string;
  };
  costSnapshot?: number; // costo al momento de confirmar
  quantity: number;
  unitPriceCOP: number; // calculado en servidor
  discountCOP: number;
  subtotalCOP: number;
  notes?: string;
}

export interface OrderStatusEvent {
  status: OrderStatus;
  actorId: ObjectId;
  at: Date;
  reason?: string;
}

export interface OrderDoc extends BranchScopedDoc {
  _id: ObjectId;
  orderNumber: string; // "PED-000001"
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  channel: OrderChannel;
  customerId?: ObjectId;
  customerName?: string;
  customerPhone?: string;
  sellerId: ObjectId;
  tableNumber?: string;
  deliveryAddress?: string;
  lines: OrderLineItem[];
  subtotalCOP: number;
  discountCOP: number;
  totalCOP: number;
  paidCOP: number;
  notes?: string;
  statusHistory: OrderStatusEvent[];
  idempotencyKey?: string;
  cancelReason?: string;
}

export interface PaymentDoc extends BranchScopedDoc {
  _id: ObjectId;
  orderId: ObjectId;
  cashSessionId?: ObjectId;
  method: string; // "cash" | "transfer" | "nequi" | "daviplata" | "card"
  amountCOP: number; // entero
  reference?: string;
  isRefund: boolean;
  linkedPaymentId?: ObjectId; // referencia al pago original si es reverso
  createdBy: ObjectId;
}

export interface CashSessionDoc extends BranchScopedDoc {
  _id: ObjectId;
  openedBy: ObjectId;
  openedAt: Date;
  openingFloatCOP: number;
  closedAt?: Date;
  closedBy?: ObjectId;
  expectedCashCOP?: number;
  countedCashCOP?: number;
  differenceCOP?: number;
  differenceReason?: string;
  status: "open" | "closed";
}

export interface CashMovementDoc extends BranchScopedDoc {
  _id: ObjectId;
  cashSessionId: ObjectId;
  direction: "in" | "out";
  method: string;
  amountCOP: number;
  sourceType: string; // "order_payment" | "expense" | "petty_cash" | "adjustment"
  sourceId?: ObjectId;
  reason?: string;
  createdBy: ObjectId;
}

export interface SupplierDoc extends BranchScopedDoc {
  _id: ObjectId;
  name: string;
  taxId?: string; // NIT o CC
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  supplyType?: string;
  paymentTermsDays?: number;
  notes?: string;
  isActive: boolean;
  createdBy: ObjectId;
}

export interface PurchaseLineItem {
  ingredientId: ObjectId;
  quantity: number;
  baseUnit: string;
  unitCostCOP: number;
  subtotalCOP: number;
}

export type PurchaseStatus = "draft" | "received" | "posted" | "cancelled";

export interface PurchaseDoc extends BranchScopedDoc {
  _id: ObjectId;
  supplierId: ObjectId;
  invoiceNumber?: string;
  issueDate: Date;
  dueDate?: Date;
  receivedDate?: Date;
  lines: PurchaseLineItem[];
  subtotalCOP: number;
  totalCOP: number;
  paidCOP: number;
  status: PurchaseStatus;
  fileRef?: string;
  idempotencyKey?: string;
  createdBy: ObjectId;
}

export interface SupplierPaymentDoc extends BranchScopedDoc {
  _id: ObjectId;
  supplierId: ObjectId;
  purchaseId: ObjectId;
  method: string;
  amountCOP: number;
  reference?: string;
  paidAt: Date;
  createdBy: ObjectId;
}

export interface ExpenseDoc extends BranchScopedDoc {
  _id: ObjectId;
  category: string;
  amountCOP: number;
  date: Date;
  method: string;
  cashSessionId?: ObjectId;
  supplierId?: ObjectId;
  payee?: string;
  description?: string;
  fileRef?: string;
  status: "pending" | "approved" | "voided";
  createdBy: ObjectId;
  approvedBy?: ObjectId;
  approvedAt?: Date;
}

export interface CustomerDoc extends BranchScopedDoc {
  _id: ObjectId;
  name: string;
  phone?: string;
  notes?: string;
  isActive: boolean;
  createdBy: ObjectId;
}

export interface AuditLogDoc {
  _id: ObjectId;
  branchId: ObjectId;
  actorId: ObjectId;
  action: string;
  entityType: string;
  entityId?: ObjectId;
  previousValue?: unknown;
  newValue?: unknown;
  reason?: string;
  ipAddress?: string;
  createdAt: Date;
}

export interface CounterDoc {
  _id: ObjectId;
  branchId: ObjectId;
  name: string; // e.g. "order"
  seq: number;
}

export interface SettingsDoc {
  _id: ObjectId;
  branchId: ObjectId;
  businessName: string;
  receiptHeader?: string;
  receiptFooter?: string;
  enabledChannels: OrderChannel[];
  paymentMethods: string[];
  allowNegativeStock: boolean;
  defaultDiscountLimitPct: number;
  expenseCategories: string[];
  updatedAt: Date;
  updatedBy: ObjectId;
}

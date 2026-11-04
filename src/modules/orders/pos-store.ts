import { create } from "zustand";
import { OFFICIAL_MENU, type MenuItem } from "@/shared/menu/catalog";

export interface CartLine {
  sku: string;
  name: string;
  unitPriceCOP: number;
  quantity: number;
  notes?: string;
  subtotalCOP: number;
}

export interface CustomerSummary {
  name: string;
  phone?: string;
  address?: string;
}

export type OrderChannel = "counter" | "takeaway" | "table" | "delivery";
export type PaymentMethod = "cash" | "nequi" | "daviplata" | "breb" | "credit";

export interface OrderRecord {
  id: string;
  orderNumber: string;
  createdAt: string;
  channel: OrderChannel;
  tableNumber?: string;
  deliveryAddress?: string;
  customer: CustomerSummary;
  lines: CartLine[];
  subtotalCOP: number;
  discountCOP: number;
  totalCOP: number;
  paymentMethod: PaymentMethod;
  amountReceivedCOP: number;
  changeCOP: number;
  creditDebtorName?: string;
  creditAuthorizedBy?: string;
  status: "CONFIRMED" | "IN_PREPARATION" | "READY" | "DELIVERED" | "CANCELLED";
  notes?: string;
}

interface PosState {
  cart: CartLine[];
  channel: OrderChannel;
  tableNumber: string;
  customer: CustomerSummary;
  paymentMethod: PaymentMethod;
  amountReceivedCOP: number;
  creditDebtorName: string;
  creditAuthorizedBy: string;
  orderNotes: string;
  orders: OrderRecord[];
  customersList: CustomerSummary[];
  
  // Actions
  addItem: (item: MenuItem) => void;
  removeItem: (sku: string) => void;
  updateQuantity: (sku: string, delta: number) => void;
  updateNotes: (sku: string, notes: string) => void;
  setChannel: (channel: OrderChannel) => void;
  setTableNumber: (table: string) => void;
  setCustomer: (customer: CustomerSummary) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setAmountReceived: (amount: number) => void;
  setCreditInfo: (debtor: string, authorizedBy: string) => void;
  setOrderNotes: (notes: string) => void;
  clearCart: () => void;
  submitOrder: () => OrderRecord | null;
  updateOrderStatus: (orderId: string, status: OrderRecord["status"]) => void;
  addCustomer: (customer: CustomerSummary) => void;
}

const INITIAL_CUSTOMERS: CustomerSummary[] = [
  { name: "Cliente General", phone: "", address: "" },
];

const INITIAL_ORDERS: OrderRecord[] = [];

export const usePosStore = create<PosState>((set, get) => ({
  cart: [],
  channel: "counter",
  tableNumber: "",
  customer: INITIAL_CUSTOMERS[0],
  paymentMethod: "cash",
  amountReceivedCOP: 0,
  creditDebtorName: "",
  creditAuthorizedBy: "",
  orderNotes: "",
  orders: INITIAL_ORDERS,
  customersList: INITIAL_CUSTOMERS,

  addItem: (item) => {
    const { cart } = get();
    const existing = cart.find((i) => i.sku === item.sku);
    if (existing) {
      set({
        cart: cart.map((i) =>
          i.sku === item.sku
            ? {
                ...i,
                quantity: i.quantity + 1,
                subtotalCOP: (i.quantity + 1) * i.unitPriceCOP,
              }
            : i
        ),
      });
    } else {
      set({
        cart: [
          ...cart,
          {
            sku: item.sku,
            name: item.name,
            unitPriceCOP: item.priceCOP,
            quantity: 1,
            subtotalCOP: item.priceCOP,
          },
        ],
      });
    }
  },

  removeItem: (sku) => {
    set({ cart: get().cart.filter((i) => i.sku !== sku) });
  },

  updateQuantity: (sku, delta) => {
    const { cart } = get();
    set({
      cart: cart
        .map((i) => {
          if (i.sku === sku) {
            const nextQty = i.quantity + delta;
            return nextQty > 0
              ? {
                  ...i,
                  quantity: nextQty,
                  subtotalCOP: nextQty * i.unitPriceCOP,
                }
              : null;
          }
          return i;
        })
        .filter(Boolean) as CartLine[],
    });
  },

  updateNotes: (sku, notes) => {
    set({
      cart: get().cart.map((i) => (i.sku === sku ? { ...i, notes } : i)),
    });
  },

  setChannel: (channel) => set({ channel }),
  setTableNumber: (tableNumber) => set({ tableNumber }),
  setCustomer: (customer) => set({ customer }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  setAmountReceived: (amountReceivedCOP) => set({ amountReceivedCOP }),
  setCreditInfo: (creditDebtorName, creditAuthorizedBy) => set({ creditDebtorName, creditAuthorizedBy }),
  setOrderNotes: (orderNotes) => set({ orderNotes }),

  clearCart: () =>
    set({
      cart: [],
      channel: "counter",
      tableNumber: "",
      customer: INITIAL_CUSTOMERS[0],
      paymentMethod: "cash",
      amountReceivedCOP: 0,
      creditDebtorName: "",
      creditAuthorizedBy: "",
      orderNotes: "",
    }),

  submitOrder: () => {
    const {
      cart,
      channel,
      tableNumber,
      customer,
      paymentMethod,
      amountReceivedCOP,
      creditDebtorName,
      creditAuthorizedBy,
      orderNotes,
      orders,
    } = get();

    if (cart.length === 0) return null;

    const subtotal = cart.reduce((acc, i) => acc + i.subtotalCOP, 0);
    const total = subtotal;
    const change = paymentMethod === "cash" ? Math.max(0, (amountReceivedCOP || total) - total) : 0;
    const nextNum = orders.length + 1;
    const orderNumber = `PED-${String(nextNum).padStart(6, "0")}`;

    const newOrder: OrderRecord = {
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toLocaleTimeString("es-CO", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      channel,
      tableNumber: channel === "table" ? tableNumber : undefined,
      deliveryAddress: channel === "delivery" ? customer.address : undefined,
      customer,
      lines: [...cart],
      subtotalCOP: subtotal,
      discountCOP: 0,
      totalCOP: total,
      paymentMethod,
      amountReceivedCOP: paymentMethod === "credit" ? 0 : amountReceivedCOP || total,
      changeCOP: change,
      creditDebtorName: paymentMethod === "credit" ? creditDebtorName || customer.name : undefined,
      creditAuthorizedBy: paymentMethod === "credit" ? creditAuthorizedBy : undefined,
      status: "CONFIRMED",
      notes: orderNotes || undefined,
    };

    set({
      orders: [newOrder, ...orders],
      cart: [],
      orderNotes: "",
      amountReceivedCOP: 0,
      creditDebtorName: "",
      creditAuthorizedBy: "",
      customer: INITIAL_CUSTOMERS[0],
    });

    return newOrder;
  },

  updateOrderStatus: (orderId, status) => {
    set({
      orders: get().orders.map((o) => (o.id === orderId ? { ...o, status } : o)),
    });
  },

  addCustomer: (customer) => {
    set({
      customersList: [customer, ...get().customersList],
      customer,
    });
  },
}));

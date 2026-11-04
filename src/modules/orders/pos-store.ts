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
export type PaymentMethod = "cash" | "nequi" | "daviplata" | "card" | "transfer";

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
  setOrderNotes: (notes: string) => void;
  clearCart: () => void;
  submitOrder: () => OrderRecord | null;
  updateOrderStatus: (orderId: string, status: OrderRecord["status"]) => void;
  addCustomer: (customer: CustomerSummary) => void;
}

const INITIAL_CUSTOMERS: CustomerSummary[] = [
  { name: "Cliente General", phone: "", address: "" },
  { name: "Carlos Gómez", phone: "310 987 6543", address: "Calle 45 # 12-30" },
  { name: "Ana Pérez", phone: "300 123 4567", address: "Carrera 7 # 85-10" },
  { name: "María Torres", phone: "320 555 1212", address: "Mesa 2" },
];

const INITIAL_ORDERS: OrderRecord[] = [
  {
    id: "ord-125",
    orderNumber: "PED-000125",
    createdAt: "10:45 AM",
    channel: "table",
    tableNumber: "5",
    customer: { name: "Cliente General" },
    lines: [
      {
        sku: "ESP-001",
        name: "Parrillada Especial",
        unitPriceCOP: 20000,
        quantity: 2,
        notes: "Bien asada la chuleta",
        subtotalCOP: 40000,
      },
      {
        sku: "CHO-001",
        name: "Chorizo",
        unitPriceCOP: 10000,
        quantity: 1,
        subtotalCOP: 10000,
      },
    ],
    subtotalCOP: 50000,
    discountCOP: 0,
    totalCOP: 50000,
    paymentMethod: "nequi",
    amountReceivedCOP: 50000,
    changeCOP: 0,
    status: "DELIVERED",
  },
  {
    id: "ord-124",
    orderNumber: "PED-000124",
    createdAt: "10:32 AM",
    channel: "takeaway",
    customer: { name: "Ana Pérez", phone: "300 123 4567" },
    lines: [
      {
        sku: "COM-001",
        name: "Pollo + Chorizo",
        unitPriceCOP: 15000,
        quantity: 2,
        notes: "Sin ensalada",
        subtotalCOP: 30000,
      },
    ],
    subtotalCOP: 30000,
    discountCOP: 0,
    totalCOP: 30000,
    paymentMethod: "cash",
    amountReceivedCOP: 50000,
    changeCOP: 20000,
    status: "IN_PREPARATION",
  },
  {
    id: "ord-123",
    orderNumber: "PED-000123",
    createdAt: "10:20 AM",
    channel: "delivery",
    deliveryAddress: "Calle 45 # 12-30",
    customer: { name: "Carlos Gómez", phone: "310 987 6543" },
    lines: [
      {
        sku: "ESP-001",
        name: "Parrillada Especial",
        unitPriceCOP: 20000,
        quantity: 3,
        subtotalCOP: 60000,
      },
    ],
    subtotalCOP: 60000,
    discountCOP: 0,
    totalCOP: 60000,
    paymentMethod: "transfer",
    amountReceivedCOP: 60000,
    changeCOP: 0,
    status: "CONFIRMED",
  },
];

export const usePosStore = create<PosState>((set, get) => ({
  cart: [],
  channel: "counter",
  tableNumber: "",
  customer: INITIAL_CUSTOMERS[0],
  paymentMethod: "cash",
  amountReceivedCOP: 0,
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
  setOrderNotes: (orderNotes) => set({ orderNotes }),

  clearCart: () =>
    set({
      cart: [],
      channel: "counter",
      tableNumber: "",
      customer: INITIAL_CUSTOMERS[0],
      amountReceivedCOP: 0,
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
      orderNotes,
      orders,
    } = get();

    if (cart.length === 0) return null;

    const subtotal = cart.reduce((acc, i) => acc + i.subtotalCOP, 0);
    const total = subtotal;
    const change = Math.max(0, (amountReceivedCOP || total) - total);
    const nextNum = 126 + orders.length - INITIAL_ORDERS.length;
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
      amountReceivedCOP: amountReceivedCOP || total,
      changeCOP: change,
      status: "CONFIRMED",
      notes: orderNotes || undefined,
    };

    set({
      orders: [newOrder, ...orders],
      cart: [],
      orderNotes: "",
      amountReceivedCOP: 0,
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

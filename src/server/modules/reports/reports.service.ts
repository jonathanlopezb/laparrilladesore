import "server-only";
import { ObjectId } from "mongodb";
import { collections } from "@/server/db/collections";

export interface SalesReportData {
  totalRevenueCOP: number;
  ordersCount: number;
  averageTicketCOP: number;
  deliveredOrdersCount: number;
  byPaymentMethod: {
    cash: number;
    nequi: number;
    daviplata: number;
    breb: number;
    credit: number;
  };
  byChannel: {
    counter: number;
    table: number;
    takeaway: number;
    delivery: number;
  };
  topDishes: {
    name: string;
    quantity: number;
    totalCOP: number;
  }[];
  activeCredits: {
    orderId: string;
    orderNumber: string;
    debtorName: string;
    authorizedBy: string;
    amountCOP: number;
    date: string;
    channel: string;
  }[];
}

export async function getSalesReport(): Promise<SalesReportData> {
  const result: SalesReportData = {
    totalRevenueCOP: 0,
    ordersCount: 0,
    averageTicketCOP: 0,
    deliveredOrdersCount: 0,
    byPaymentMethod: {
      cash: 0,
      nequi: 0,
      daviplata: 0,
      breb: 0,
      credit: 0,
    },
    byChannel: {
      counter: 0,
      table: 0,
      takeaway: 0,
      delivery: 0,
    },
    topDishes: [],
    activeCredits: [],
  };

  const dishesMap: Record<string, { quantity: number; totalCOP: number }> = {};

  try {
    if (process.env.MONGODB_URI) {
      const col = await collections.orders();
      const docs: any[] = await col.find({}).sort({ createdAt: -1 }).toArray();

      result.ordersCount = docs.length;

      docs.forEach((d) => {
        const total = d.totalCOP || 0;
        result.totalRevenueCOP += total;

        if (d.status === "DELIVERED") {
          result.deliveredOrdersCount += 1;
        }

        // Canal
        const ch = (d.channel || "counter") as keyof typeof result.byChannel;
        if (result.byChannel[ch] !== undefined) {
          result.byChannel[ch] += total;
        } else {
          result.byChannel.counter += total;
        }

        // Método de pago
        const pm = (d.paymentMethod || "").toLowerCase();
        const isCredit = pm === "credit" || d.paymentStatus === "UNPAID" || d.notes?.includes("FIADO");

        if (isCredit) {
          result.byPaymentMethod.credit += total;
          result.activeCredits.push({
            orderId: d._id.toString(),
            orderNumber: d.orderNumber || "PED",
            debtorName: d.creditDebtorName || d.customerName || "Cliente",
            authorizedBy: d.creditAuthorizedBy || (d.notes?.includes("AUT: Sore") ? "Sore" : "Jonathan"),
            amountCOP: total,
            date: d.createdAt ? new Date(d.createdAt).toLocaleDateString("es-CO") : "Hoy",
            channel: d.channel || "mostrador",
          });
        } else if (pm === "nequi" || d.notes?.includes("PAGO: nequi")) {
          result.byPaymentMethod.nequi += total;
        } else if (pm === "daviplata" || d.notes?.includes("PAGO: daviplata")) {
          result.byPaymentMethod.daviplata += total;
        } else if (pm === "breb" || d.notes?.includes("PAGO: breb")) {
          result.byPaymentMethod.breb += total;
        } else {
          result.byPaymentMethod.cash += total;
        }

        // Platos
        if (Array.isArray(d.lines)) {
          d.lines.forEach((l: any) => {
            const name = l.productSnapshot?.name || l.name || "Plato Parrilla";
            const qty = l.quantity || 1;
            const sub = l.subtotalCOP || (l.unitPriceCOP ? l.unitPriceCOP * qty : 0);

            if (!dishesMap[name]) {
              dishesMap[name] = { quantity: 0, totalCOP: 0 };
            }
            dishesMap[name].quantity += qty;
            dishesMap[name].totalCOP += sub;
          });
        }
      });

      result.averageTicketCOP = result.ordersCount > 0 ? Math.round(result.totalRevenueCOP / result.ordersCount) : 0;

      result.topDishes = Object.entries(dishesMap)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.quantity - a.quantity);
    }
  } catch (err) {
    console.warn("[ReportsService] Fallback a reporte en memoria:", err);
  }

  return result;
}

export async function settleCredit(orderId: string): Promise<boolean> {
  if (!process.env.MONGODB_URI) {
    return true;
  }

  try {
    const col = await collections.orders();
    if (ObjectId.isValid(orderId)) {
      await col.updateOne(
        { _id: new ObjectId(orderId) },
        {
          $set: {
            paymentStatus: "PAID",
            paidCOP: 99999999, // se marca como saldado
            notes: "CRÉDITO SALDADO Y COBRADO",
            updatedAt: new Date(),
          },
        }
      );
    }
    return true;
  } catch (error) {
    console.error("[ReportsService] Error saldando crédito en DB:", error);
    return false;
  }
}

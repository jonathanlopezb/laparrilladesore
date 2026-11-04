import "server-only";
import { ObjectId } from "mongodb";
import { collections } from "@/server/db/collections";
import type { OrderRecord } from "@/modules/orders/pos-store";

// Memoria de respaldo si MongoDB no está conectada
let memoryOrders: OrderRecord[] = [];

export async function getOrders() {
  try {
    if (!process.env.MONGODB_URI) {
      return memoryOrders;
    }

    const col = await collections.orders();
    const docs = await col.find({}).sort({ createdAt: -1 }).limit(50).toArray();

    return docs.map((d) => ({
      id: d._id.toString(),
      orderNumber: d.orderNumber,
      createdAt: d.createdAt.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: true }),
      channel: d.channel,
      tableNumber: d.tableNumber,
      deliveryAddress: d.deliveryAddress,
      customer: {
        name: d.customerName || "Cliente General",
        phone: d.customerPhone,
      },
      lines: d.lines.map((l) => ({
        sku: l.productSnapshot.sku,
        name: l.productSnapshot.name,
        unitPriceCOP: l.unitPriceCOP,
        quantity: l.quantity,
        notes: l.notes,
        subtotalCOP: l.subtotalCOP,
      })),
      subtotalCOP: d.subtotalCOP,
      discountCOP: d.discountCOP,
      totalCOP: d.totalCOP,
      paymentMethod: (d.paymentMethod || (d.notes?.includes("PAGO:") ? d.notes.split("PAGO:")[1]?.split("|")[0]?.trim() : "cash")) as any,
      amountReceivedCOP: d.paidCOP || d.totalCOP,
      changeCOP: 0,
      creditDebtorName: d.creditDebtorName,
      creditAuthorizedBy: d.creditAuthorizedBy,
      status: d.status,
      notes: d.notes,
    }));
  } catch (error) {
    console.warn("[OrdersService] Fallback a memoria local:", error);
    return memoryOrders;
  }
}

export async function createOrder(order: OrderRecord) {
  try {
    memoryOrders.unshift(order);

    if (!process.env.MONGODB_URI) {
      return order;
    }

    const col = await collections.orders();
    const isCredit = order.paymentMethod === "credit";
    const doc = {
      _id: new ObjectId(),
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: isCredit ? "UNPAID" : "PAID",
      paymentMethod: order.paymentMethod,
      creditDebtorName: order.creditDebtorName || (isCredit ? order.customer.name : undefined),
      creditAuthorizedBy: order.creditAuthorizedBy || (isCredit ? "Jonathan" : undefined),
      channel: order.channel,
      customerName: order.customer.name,
      customerPhone: order.customer.phone,
      sellerId: new ObjectId("000000000000000000000000"),
      tableNumber: order.tableNumber,
      deliveryAddress: order.deliveryAddress,
      lines: order.lines.map((l) => ({
        productId: new ObjectId("000000000000000000000000"),
        productSnapshot: {
          name: l.name,
          sku: l.sku,
          priceCOP: l.unitPriceCOP,
        },
        quantity: l.quantity,
        unitPriceCOP: l.unitPriceCOP,
        discountCOP: 0,
        subtotalCOP: l.subtotalCOP,
        notes: l.notes,
      })),
      subtotalCOP: order.subtotalCOP,
      discountCOP: 0,
      totalCOP: order.totalCOP,
      paidCOP: isCredit ? 0 : order.amountReceivedCOP,
      notes: isCredit
        ? `${order.notes || ""} | FIADO A: ${order.creditDebtorName || order.customer.name} | AUT: ${order.creditAuthorizedBy || "Jonathan"}`
        : `${order.notes || ""} | PAGO: ${order.paymentMethod}`,
      statusHistory: [
        {
          status: order.status,
          actorId: new ObjectId("000000000000000000000000"),
          at: new Date(),
        },
      ],
      branchId: new ObjectId("000000000000000000000000"),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await col.insertOne(doc as any);
    return order;
  } catch (error) {
    console.warn("[OrdersService] Error guardando pedido en DB:", error);
    return order;
  }
}

export async function updateOrderStatus(orderNumber: string, status: OrderRecord["status"]) {
  try {
    memoryOrders = memoryOrders.map((o) =>
      o.orderNumber === orderNumber || o.id === orderNumber ? { ...o, status } : o
    );

    if (!process.env.MONGODB_URI) {
      return true;
    }

    const col = await collections.orders();
    await col.updateOne(
      { orderNumber },
      {
        $set: { status, updatedAt: new Date() },
        $push: {
          statusHistory: {
            status,
            actorId: new ObjectId("000000000000000000000000"),
            at: new Date(),
          },
        } as any,
      }
    );
    return true;
  } catch (error) {
    console.warn("[OrdersService] Error actualizando estado de pedido:", error);
    return true;
  }
}

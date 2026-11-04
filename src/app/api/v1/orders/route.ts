import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrders, createOrder, updateOrderStatus } from "@/server/modules/orders/orders.service";
import { ok, created, handleError } from "@/server/http/response";

const OrderSchema = z.object({
  id: z.string(),
  orderNumber: z.string(),
  createdAt: z.string(),
  channel: z.enum(["counter", "takeaway", "table", "delivery"]),
  tableNumber: z.string().optional(),
  deliveryAddress: z.string().optional(),
  customer: z.object({
    name: z.string(),
    phone: z.string().optional(),
    address: z.string().optional(),
  }),
  lines: z.array(
    z.object({
      sku: z.string(),
      name: z.string(),
      unitPriceCOP: z.number().int().positive(),
      quantity: z.number().int().positive(),
      notes: z.string().optional(),
      subtotalCOP: z.number().int().positive(),
    })
  ),
  subtotalCOP: z.number().int().nonnegative(),
  discountCOP: z.number().int().nonnegative(),
  totalCOP: z.number().int().positive(),
  paymentMethod: z.enum(["cash", "nequi", "daviplata", "card", "transfer"]),
  amountReceivedCOP: z.number().int().nonnegative(),
  changeCOP: z.number().int().nonnegative(),
  status: z.enum(["CONFIRMED", "IN_PREPARATION", "READY", "DELIVERED", "CANCELLED"]),
  notes: z.string().optional(),
});

export async function GET() {
  try {
    const orders = await getOrders();
    return ok(orders);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = OrderSchema.parse(body);
    const order = await createOrder(validated as any);
    return created(order);
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { orderNumber, status } = body;
    if (!orderNumber || !status) {
      return NextResponse.json({ error: { message: "orderNumber y status requeridos" } }, { status: 400 });
    }
    await updateOrderStatus(orderNumber, status);
    return ok({ success: true, orderNumber, status });
  } catch (error) {
    return handleError(error);
  }
}

import { ok, created, handleError } from "@/server/http/response";
import {
  getInventory,
  recordStockMovement,
  getStockMovements,
} from "@/server/modules/inventory/inventory.service";
import { z } from "zod";

const MovementSchema = z.object({
  ingredientId: z.string(),
  movementType: z.enum(["IN_PURCHASE", "OUT_WASTE", "OUT_SALE", "ADJUSTMENT"]),
  quantity: z.number().positive("La cantidad debe ser mayor a 0"),
  unitCostCOP: z.number().nonnegative().optional(),
  totalCostCOP: z.number().nonnegative().optional(),
  supplierName: z.string().optional(),
  supplierId: z.string().optional(),
  reason: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const items = await getInventory();
    const movements = await getStockMovements(50);
    return ok({ items, movements });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = MovementSchema.parse(body);
    const movement = await recordStockMovement(validated);
    return created(movement);
  } catch (error) {
    return handleError(error);
  }
}

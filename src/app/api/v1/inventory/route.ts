import { ok, created, handleError } from "@/server/http/response";
import {
  getInventory,
  recordStockMovement,
  getStockMovements,
  createIngredient,
  updateIngredient,
  deleteIngredient,
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

const CreateIngredientSchema = z.object({
  sku: z.string().min(2),
  name: z.string().min(2),
  category: z.enum(["carnes", "verduras", "bebidas", "insumos", "empaques"]),
  unit: z.string().min(1),
  minStock: z.number().nonnegative(),
  unitCostCOP: z.number().nonnegative(),
  initialStock: z.number().nonnegative().optional(),
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
    if (body.action === "create_ingredient") {
      const validated = CreateIngredientSchema.parse(body);
      const item = await createIngredient(validated);
      return created(item);
    }

    const validated = MovementSchema.parse(body);
    const movement = await recordStockMovement(validated);
    return created(movement);
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, ...data } = body;
    if (!id) {
      return handleError(new Error("ID de insumo requerido"));
    }
    await updateIngredient(id, data);
    return ok({ success: true, id });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return handleError(new Error("ID de insumo requerido"));
    }
    await deleteIngredient(id);
    return ok({ success: true, id });
  } catch (error) {
    return handleError(error);
  }
}

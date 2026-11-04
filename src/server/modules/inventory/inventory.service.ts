import "server-only";
import { ObjectId } from "mongodb";
import { collections } from "@/server/db/collections";
import { DISH_RECIPES } from "@/shared/inventory/recipes";

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: "carnes" | "verduras" | "bebidas" | "insumos" | "empaques";
  unit: string;
  currentStock: number;
  minStock: number;
  unitCostCOP: number;
  lastUpdated?: string;
}

export interface StockMovementRecord {
  id: string;
  ingredientId: string;
  ingredientName: string;
  movementType: "IN_PURCHASE" | "OUT_WASTE" | "OUT_SALE" | "ADJUSTMENT";
  quantity: number;
  reason?: string;
  createdAt: string;
}

const DEFAULT_INVENTORY: Omit<InventoryItem, "id">[] = [
  {
    sku: "INS-001",
    name: "Presas de Pollo Seleccionadas",
    category: "carnes",
    unit: "presas",
    currentStock: 0,
    minStock: 20,
    unitCostCOP: 4500,
  },
  {
    sku: "INS-002",
    name: "Chuleta de Cerdo Fresca",
    category: "carnes",
    unit: "cortes",
    currentStock: 0,
    minStock: 15,
    unitCostCOP: 5000,
  },
  {
    sku: "INS-003",
    name: "Chorizo Artesanal Santarrosano",
    category: "carnes",
    unit: "unidades",
    currentStock: 0,
    minStock: 25,
    unitCostCOP: 3200,
  },
  {
    sku: "INS-004",
    name: "Papa Criolla y Pastusa",
    category: "verduras",
    unit: "kg",
    currentStock: 0,
    minStock: 15,
    unitCostCOP: 2800,
  },
  {
    sku: "INS-005",
    name: "Ensalada de la Casa (Porciones)",
    category: "verduras",
    unit: "porciones",
    currentStock: 0,
    minStock: 20,
    unitCostCOP: 1200,
  },
  {
    sku: "INS-006",
    name: "Salsa Secreta de la Casa",
    category: "insumos",
    unit: "litros",
    currentStock: 0,
    minStock: 5,
    unitCostCOP: 6000,
  },
  {
    sku: "INS-007",
    name: "Carbón Vegetal Seleccionado",
    category: "insumos",
    unit: "bultos",
    currentStock: 0,
    minStock: 3,
    unitCostCOP: 38000,
  },
  {
    sku: "INS-008",
    name: "Cajas Térmicas para Llevar / Domicilios",
    category: "empaques",
    unit: "unidades",
    currentStock: 0,
    minStock: 50,
    unitCostCOP: 650,
  },
  {
    sku: "INS-009",
    name: "Gaseosas y Refrescos 400ml",
    category: "bebidas",
    unit: "unidades",
    currentStock: 0,
    minStock: 24,
    unitCostCOP: 2200,
  },
];

let memoryInventory: InventoryItem[] = DEFAULT_INVENTORY.map((item, idx) => ({
  ...item,
  id: `inv-${idx + 1}`,
  lastUpdated: new Date().toISOString(),
}));

let memoryMovements: StockMovementRecord[] = [];

export async function getInventory(): Promise<InventoryItem[]> {
  try {
    if (!process.env.MONGODB_URI) {
      return memoryInventory;
    }

    const col = await collections.ingredients();
    const count = await col.countDocuments();

    // Auto-seed si está vacío — ahora con stock 0 (el operador ingresa su propio stock)
    if (count === 0) {
      const docs = DEFAULT_INVENTORY.map((item) => ({
        _id: new ObjectId(),
        sku: item.sku,
        name: item.name,
        baseUnit: item.unit,
        currentStock: 0,
        minStock: item.minStock,
        costCOP: item.unitCostCOP,
        category: item.category,
        isActive: true,
        branchId: new ObjectId("000000000000000000000000"),
        createdBy: new ObjectId("000000000000000000000000"),
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      await col.insertMany(docs as any);
    }

    const docs = await col.find({ isActive: true }).sort({ name: 1 }).toArray();

    return docs.map((d: any) => ({
      id: d._id.toString(),
      sku: d.sku || "INS-000",
      name: d.name,
      category: d.category || "insumos",
      unit: d.baseUnit || d.unit || "unidades",
      currentStock: d.currentStock ?? 0,
      minStock: d.minStock || 0,
      unitCostCOP: d.costCOP || d.unitCostCOP || 0,
      lastUpdated: d.updatedAt ? d.updatedAt.toISOString() : undefined,
    }));
  } catch (error) {
    console.warn("[InventoryService] Fallback a memoria local:", error);
    return memoryInventory;
  }
}

export async function recordStockMovement(data: {
  ingredientId: string;
  movementType: "IN_PURCHASE" | "OUT_WASTE" | "OUT_SALE" | "ADJUSTMENT";
  quantity: number;
  reason?: string;
}) {
  const movementRecord: StockMovementRecord = {
    id: new ObjectId().toString(),
    ingredientId: data.ingredientId,
    ingredientName: "",
    movementType: data.movementType,
    quantity: data.quantity,
    reason: data.reason,
    createdAt: new Date().toISOString(),
  };

  // Actualización en memoria
  const itemIndex = memoryInventory.findIndex(
    (i) => i.id === data.ingredientId || i.sku === data.ingredientId
  );
  if (itemIndex >= 0) {
    movementRecord.ingredientName = memoryInventory[itemIndex].name;
    const current = memoryInventory[itemIndex].currentStock;
    if (data.movementType === "IN_PURCHASE" || data.movementType === "ADJUSTMENT") {
      memoryInventory[itemIndex].currentStock = Math.max(0, current + data.quantity);
    } else {
      memoryInventory[itemIndex].currentStock = Math.max(0, current - data.quantity);
    }
    memoryInventory[itemIndex].lastUpdated = new Date().toISOString();
  }
  memoryMovements.unshift(movementRecord);

  if (!process.env.MONGODB_URI) {
    return movementRecord;
  }

  try {
    const colIngredients = await collections.ingredients();
    const colMovements = await collections.stockMovements();

    const changeQty =
      data.movementType === "IN_PURCHASE" || data.movementType === "ADJUSTMENT"
        ? Math.abs(data.quantity)
        : -Math.abs(data.quantity);

    // Buscar por ID o por SKU
    let ingredient: any = null;
    if (ObjectId.isValid(data.ingredientId)) {
      ingredient = await colIngredients.findOne({ _id: new ObjectId(data.ingredientId) });
    }
    if (!ingredient) {
      ingredient = await colIngredients.findOne({ sku: data.ingredientId } as any);
    }

    if (ingredient) {
      movementRecord.ingredientName = ingredient.name;
      await colIngredients.updateOne(
        { _id: ingredient._id },
        {
          $inc: { currentStock: changeQty },
          $set: { updatedAt: new Date() },
        }
      );

      await colMovements.insertOne({
        _id: new ObjectId(movementRecord.id),
        ingredientId: ingredient._id,
        movementType: (data.movementType === "IN_PURCHASE" ? "PURCHASE_RECEIPT" : "OUT_SALE") as any,
        quantity: changeQty,
        reason: data.reason,
        branchId: new ObjectId("000000000000000000000000"),
        createdBy: new ObjectId("000000000000000000000000"),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
    }

    return movementRecord;
  } catch (error) {
    console.error("[InventoryService] Error registrando movimiento en DB:", error);
    return movementRecord;
  }
}

/**
 * Descuenta automáticamente los insumos del inventario al confirmar un pedido.
 * Aplica las recetas definidas en DISH_RECIPES basadas en el SKU del plato.
 */
export async function deductInventoryForOrder(
  lines: { sku: string; name: string; quantity: number }[]
) {
  try {
    for (const line of lines) {
      const recipe = DISH_RECIPES[line.sku];
      if (!recipe) {
        console.log(`[Inventory] Sin receta para ${line.sku} (${line.name}), omitiendo descuento.`);
        continue;
      }

      for (const ingredient of recipe) {
        const totalQty = ingredient.quantity * line.quantity;
        await recordStockMovement({
          ingredientId: ingredient.inventorySku,
          movementType: "OUT_SALE",
          quantity: totalQty,
          reason: `Venta: ${line.quantity}x ${line.name}`,
        });
      }
    }
  } catch (error) {
    console.error("[InventoryService] Error descontando inventario por pedido:", error);
  }
}

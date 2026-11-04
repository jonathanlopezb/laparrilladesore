/**
 * src/shared/inventory/recipes.ts
 * Recetas de cada plato: qué insumos (SKU) se consumen al vender 1 unidad.
 * Estas cantidades se descuentan automáticamente del inventario en cada pedido confirmado.
 * El chef/administrador puede ajustar las cantidades aquí según el estándar de cocina.
 */

export interface RecipeIngredient {
  inventorySku: string; // SKU del insumo en el inventario
  quantity: number; // Cantidad que se consume por PORCIÓN / UNIDAD del plato
}

export const DISH_RECIPES: Record<string, RecipeIngredient[]> = {
  // 🍗 Pollo
  "POL-001": [
    { inventorySku: "INS-001", quantity: 1 },   // 1 presa de pollo
    { inventorySku: "INS-004", quantity: 0.3 }, // 300g de papa (0.3 kg)
    { inventorySku: "INS-005", quantity: 1 },   // 1 porción de ensalada
    { inventorySku: "INS-006", quantity: 0.05 }, // 50ml de salsa (0.05 litros)
  ],

  // 🥩 Chuleta
  "CHU-001": [
    { inventorySku: "INS-002", quantity: 1 },   // 1 corte de chuleta
    { inventorySku: "INS-004", quantity: 0.3 }, // 300g de papa
    { inventorySku: "INS-005", quantity: 1 },   // 1 porción de ensalada
    { inventorySku: "INS-006", quantity: 0.05 }, // 50ml de salsa
  ],

  // 🌭 Chorizo
  "CHO-001": [
    { inventorySku: "INS-003", quantity: 1 },   // 1 chorizo
    { inventorySku: "INS-004", quantity: 0.3 }, // 300g de papa
    { inventorySku: "INS-005", quantity: 1 },   // 1 porción de ensalada
    { inventorySku: "INS-006", quantity: 0.05 }, // 50ml de salsa
  ],

  // 🍗🌭 Pollo + Chorizo
  "COM-001": [
    { inventorySku: "INS-001", quantity: 1 },   // 1 presa de pollo
    { inventorySku: "INS-003", quantity: 1 },   // 1 chorizo
    { inventorySku: "INS-004", quantity: 0.3 }, // 300g de papa
    { inventorySku: "INS-005", quantity: 1 },   // 1 porción de ensalada
    { inventorySku: "INS-006", quantity: 0.05 }, // 50ml de salsa
  ],

  // 🥩🌭 Chuleta + Chorizo
  "COM-002": [
    { inventorySku: "INS-002", quantity: 1 },   // 1 chuleta
    { inventorySku: "INS-003", quantity: 1 },   // 1 chorizo
    { inventorySku: "INS-004", quantity: 0.3 }, // 300g de papa
    { inventorySku: "INS-005", quantity: 1 },   // 1 porción de ensalada
    { inventorySku: "INS-006", quantity: 0.05 }, // 50ml de salsa
  ],

  // 🥩🍗 Chuleta + Pollo
  "COM-003": [
    { inventorySku: "INS-002", quantity: 1 },   // 1 chuleta
    { inventorySku: "INS-001", quantity: 1 },   // 1 presa de pollo
    { inventorySku: "INS-004", quantity: 0.3 }, // 300g de papa
    { inventorySku: "INS-005", quantity: 1 },   // 1 porción de ensalada
    { inventorySku: "INS-006", quantity: 0.05 }, // 50ml de salsa
  ],

  // 🔥 Parrillada Especial (Chuleta + Pollo + Chorizo)
  "ESP-001": [
    { inventorySku: "INS-002", quantity: 1 },   // 1 chuleta
    { inventorySku: "INS-001", quantity: 1 },   // 1 presa de pollo
    { inventorySku: "INS-003", quantity: 1 },   // 1 chorizo
    { inventorySku: "INS-004", quantity: 0.4 }, // 400g de papa (porción extra)
    { inventorySku: "INS-005", quantity: 1 },   // 1 porción de ensalada
    { inventorySku: "INS-006", quantity: 0.08 }, // 80ml de salsa
  ],
};

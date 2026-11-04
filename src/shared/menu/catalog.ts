/**
 * src/shared/menu/catalog.ts
 * Catálogo oficial de los 7 platos de La Parrilla de Sore
 * Fuente de verdad: Menú fotográfico suministrado (media_1793820759518_5f5d1244.jpg)
 * Moneda: Enteros COP.
 */

export interface MenuItem {
  sku: string;
  name: string;
  category: "Individuales" | "Combos" | "Especiales";
  description: string;
  priceCOP: number;
  accompaniments: string; // "papa, ensalada y salsa de la casa"
  isSpecial?: boolean;
}

export const OFFICIAL_MENU: MenuItem[] = [
  {
    sku: "POL-001",
    name: "Pollo",
    category: "Individuales",
    description: "200 g de pollo asado a la parrilla",
    priceCOP: 13000,
    accompaniments: "Papa, ensalada y salsa de la casa",
  },
  {
    sku: "CHU-001",
    name: "Chuleta",
    category: "Individuales",
    description: "1 chuleta de cerdo con hueso a la brasa",
    priceCOP: 12000,
    accompaniments: "Papa, ensalada y salsa de la casa",
  },
  {
    sku: "CHO-001",
    name: "Chorizo",
    category: "Individuales",
    description: "1 chorizo asado artesanal",
    priceCOP: 10000,
    accompaniments: "Papa, ensalada y salsa de la casa",
  },
  {
    sku: "COM-001",
    name: "Pollo + Chorizo",
    category: "Combos",
    description: "100 g de pollo asado + 1 chorizo artesanal",
    priceCOP: 15000,
    accompaniments: "Papa, ensalada y salsa de la casa",
  },
  {
    sku: "COM-002",
    name: "Chuleta + Chorizo",
    category: "Combos",
    description: "1 chuleta de cerdo + 1 chorizo asado",
    priceCOP: 14000,
    accompaniments: "Papa, ensalada y salsa de la casa",
  },
  {
    sku: "COM-003",
    name: "Chuleta + Pollo",
    category: "Combos",
    description: "1 chuleta de cerdo + 100 g de pollo asado",
    priceCOP: 16000,
    accompaniments: "Papa, ensalada y salsa de la casa",
  },
  {
    sku: "ESP-001",
    name: "Parrillada Especial",
    category: "Especiales",
    description: "Chuleta + pollo + chorizo",
    priceCOP: 20000,
    accompaniments: "Papa, ensalada y salsa de la casa",
    isSpecial: true,
  },
];

export const MENU_CATEGORIES = ["Todos", "Individuales", "Combos", "Especiales"] as const;

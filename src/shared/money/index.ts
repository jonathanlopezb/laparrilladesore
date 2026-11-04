/**
 * src/shared/money/index.ts
 * Utilidades para manejo de dinero en COP (enteros).
 * Regla: NO usar float para dinero. Todo en enteros de pesos colombianos.
 */

/** Formatea un entero COP a string legible: 13000 → "$13.000" */
export function formatCOP(amountCOP: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amountCOP);
}

/** Suma segura de enteros COP */
export function sumCOP(...amounts: number[]): number {
  return amounts.reduce((acc, n) => acc + Math.round(n), 0);
}

/** Aplica un porcentaje de descuento y devuelve el valor del descuento (entero) */
export function discountAmount(amountCOP: number, pct: number): number {
  return Math.round((amountCOP * pct) / 100);
}

/** Verifica que un valor es un entero COP válido (no negativo, no float) */
export function isValidCOP(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

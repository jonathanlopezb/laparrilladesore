/**
 * tests/unit/money.test.ts
 * Tests unitarios para utilidades de dinero COP.
 */
import { describe, it, expect } from "vitest";
import { formatCOP, sumCOP, discountAmount, isValidCOP } from "@/shared/money";

describe("formatCOP", () => {
  it("formatea 13000 como $13.000", () => {
    expect(formatCOP(13000)).toBe("$\u00a013.000");
  });

  it("formatea 0 como $0", () => {
    const result = formatCOP(0);
    expect(result).toContain("0");
  });
});

describe("sumCOP", () => {
  it("suma correctamente enteros", () => {
    expect(sumCOP(10000, 15000, 12000)).toBe(37000);
  });

  it("retorna 0 para lista vacía", () => {
    expect(sumCOP()).toBe(0);
  });

  it("redondea antes de sumar", () => {
    // Números que ya son enteros
    expect(sumCOP(13000, 14000)).toBe(27000);
  });
});

describe("discountAmount", () => {
  it("calcula 10% de 20000 = 2000", () => {
    expect(discountAmount(20000, 10)).toBe(2000);
  });

  it("calcula 0% = 0", () => {
    expect(discountAmount(15000, 0)).toBe(0);
  });

  it("redondea al entero más cercano", () => {
    // 10000 * 33% / 100 = 3300
    expect(discountAmount(10000, 33)).toBe(3300);
  });
});

describe("isValidCOP", () => {
  it("acepta entero positivo", () => {
    expect(isValidCOP(13000)).toBe(true);
  });

  it("acepta cero", () => {
    expect(isValidCOP(0)).toBe(true);
  });

  it("rechaza float", () => {
    expect(isValidCOP(13.5)).toBe(false);
  });

  it("rechaza negativo", () => {
    expect(isValidCOP(-100)).toBe(false);
  });

  it("rechaza string", () => {
    expect(isValidCOP("13000")).toBe(false);
  });

  it("rechaza null", () => {
    expect(isValidCOP(null)).toBe(false);
  });
});

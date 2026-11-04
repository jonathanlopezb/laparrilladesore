/**
 * tests/unit/dates.test.ts
 * Tests unitarios para utilidades de fecha Bogotá.
 */
import { describe, it, expect } from "vitest";
import { startOfBogotaDay, endOfBogotaDay, displayDate, nowUTC } from "@/shared/dates";

describe("startOfBogotaDay", () => {
  it("retorna la medianoche de Bogotá en UTC", () => {
    // Bogotá es UTC-5. Medianoche Bogotá = 05:00 UTC
    const bogotaNoon = new Date("2026-11-04T17:00:00Z"); // 12:00 Bogotá
    const start = startOfBogotaDay(bogotaNoon);
    expect(start.toISOString()).toBe("2026-11-04T05:00:00.000Z");
  });
});

describe("endOfBogotaDay", () => {
  it("retorna 23:59:59.999 Bogotá en UTC", () => {
    const bogotaNoon = new Date("2026-11-04T17:00:00Z");
    const end = endOfBogotaDay(bogotaNoon);
    expect(end.toISOString()).toBe("2026-11-05T04:59:59.999Z");
  });
});

describe("displayDate", () => {
  it("formatea una fecha UTC en zona Bogotá", () => {
    const utc = new Date("2026-11-04T18:00:00Z"); // 13:00 Bogotá
    const result = displayDate(utc, "HH:mm");
    expect(result).toBe("13:00");
  });
});

describe("nowUTC", () => {
  it("retorna un Date", () => {
    expect(nowUTC()).toBeInstanceOf(Date);
  });
});

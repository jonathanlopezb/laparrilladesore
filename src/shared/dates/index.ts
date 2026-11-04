/**
 * src/shared/dates/index.ts
 * Utilidades de fecha con zona horaria America/Bogota.
 * Regla: timestamps se guardan en UTC; el día de negocio usa Bogotá.
 */
import {
  format,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  parseISO,
} from "date-fns";
import { toZonedTime, fromZonedTime, formatInTimeZone } from "date-fns-tz";

export const BOGOTA_TZ = "America/Bogota";

/** Inicio del día en Bogotá, retornado como UTC Date */
export function startOfBogotaDay(date: Date): Date {
  const zoned = toZonedTime(date, BOGOTA_TZ);
  return fromZonedTime(startOfDay(zoned), BOGOTA_TZ);
}

/** Fin del día en Bogotá, retornado como UTC Date */
export function endOfBogotaDay(date: Date): Date {
  const zoned = toZonedTime(date, BOGOTA_TZ);
  return fromZonedTime(endOfDay(zoned), BOGOTA_TZ);
}

/** Inicio del mes en Bogotá, retornado como UTC Date */
export function startOfBogotaMonth(date: Date): Date {
  const zoned = toZonedTime(date, BOGOTA_TZ);
  return fromZonedTime(startOfMonth(zoned), BOGOTA_TZ);
}

/** Fin del mes en Bogotá, retornado como UTC Date */
export function endOfBogotaMonth(date: Date): Date {
  const zoned = toZonedTime(date, BOGOTA_TZ);
  return fromZonedTime(endOfMonth(zoned), BOGOTA_TZ);
}

/** Formatea una Date UTC como string para mostrar en Bogotá */
export function displayDate(date: Date, fmt = "dd/MM/yyyy HH:mm"): string {
  return formatInTimeZone(date, BOGOTA_TZ, fmt);
}

/** Parsea una fecha ISO (string) a Date UTC */
export function parseDate(iso: string): Date {
  return parseISO(iso);
}

/** Fecha y hora actual en UTC */
export function nowUTC(): Date {
  return new Date();
}

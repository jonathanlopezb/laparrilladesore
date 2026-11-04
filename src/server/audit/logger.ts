/**
 * src/server/audit/logger.ts
 * Escritura de audit logs — append-only, servidor únicamente.
 */
import "server-only";
import { ObjectId } from "mongodb";
import { collections } from "@/server/db/collections";
import { nowUTC } from "@/shared/dates";

export interface AuditEntry {
  branchId: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId?: string;
  previousValue?: unknown;
  newValue?: unknown;
  reason?: string;
  ipAddress?: string;
}

/**
 * Registra una entrada de auditoría.
 * No lanza si falla el log — retorna false en error para no interrumpir
 * la operación principal, pero sí registra el error en consola.
 */
export async function writeAuditLog(entry: AuditEntry): Promise<boolean> {
  try {
    const col = await collections.auditLogs();
    await col.insertOne({
      _id: new ObjectId(),
      branchId: new ObjectId(entry.branchId),
      actorId: new ObjectId(entry.actorId),
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId ? new ObjectId(entry.entityId) : undefined,
      previousValue: entry.previousValue,
      newValue: entry.newValue,
      reason: entry.reason,
      ipAddress: entry.ipAddress,
      createdAt: nowUTC(),
    });
    return true;
  } catch (err) {
    // Nunca debe silenciar errores de DB de fondo sin registro
    console.error("[audit] Error escribiendo log de auditoría:", err);
    return false;
  }
}

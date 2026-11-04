import "server-only";
import { ObjectId } from "mongodb";
import { collections } from "@/server/db/collections";

export interface CashSessionData {
  id: string;
  status: "open" | "closed";
  openedAt: string;
  openedBy: string;
  openingFloatCOP: number;
  closedAt?: string;
  closedBy?: string;
  expectedCashCOP?: number;
  countedCashCOP?: number;
  differenceCOP?: number;
  differenceReason?: string;
  notes?: string;
}

export interface CashMovementData {
  id: string;
  sessionId: string;
  direction: "in" | "out";
  amountCOP: number;
  reason: string;
  category: "egreso_menor" | "ingreso_extra" | "pago_domicilio" | "compra_urgente";
  createdAt: string;
}

export interface CashTurnoSummary {
  currentSession: CashSessionData | null;
  openingFloatCOP: number;
  cashSalesCOP: number;
  transferSalesCOP: number; // Nequi + Daviplata + Bre-B
  creditSalesCOP: number; // Fiados
  totalSalesCOP: number;
  cashOutflowCOP: number; // Egresos menores de caja
  cashInflowCOP: number; // Ingresos adicionales a base
  expectedCashCOP: number; // Base + Ventas Efectivo + Ingresos - Egresos
  recentMovements: CashMovementData[];
}

let memorySession: CashSessionData | null = {
  id: "session-init",
  status: "open",
  openedAt: new Date().toISOString(),
  openedBy: "Jonathan López",
  openingFloatCOP: 50000,
  notes: "Turno del día iniciado con base en sencillo",
};

let memoryMovements: CashMovementData[] = [];

export async function getCashTurnoSummary(): Promise<CashTurnoSummary> {
  let currentSession: CashSessionData | null = memorySession;
  let movements: CashMovementData[] = memoryMovements;
  let cashSalesCOP = 0;
  let transferSalesCOP = 0;
  let creditSalesCOP = 0;
  let totalSalesCOP = 0;

  try {
    if (process.env.MONGODB_URI) {
      const colSessions = await collections.cashSessions();
      const colOrders = await collections.orders();
      const colMovements = await collections.cashMovements();

      // Buscar sesión abierta
      const openDoc: any = await colSessions.findOne({ status: "open" }, { sort: { openedAt: -1 } });
      if (openDoc) {
        currentSession = {
          id: openDoc._id.toString(),
          status: openDoc.status,
          openedAt: openDoc.openedAt ? openDoc.openedAt.toISOString() : new Date().toISOString(),
          openedBy: openDoc.openedByName || "Jonathan López",
          openingFloatCOP: openDoc.openingFloatCOP || 0,
          notes: openDoc.notes,
        };
      } else {
        currentSession = null;
      }

      // Traer movimientos de la sesión
      const movementDocs: any[] = await colMovements.find({}).sort({ createdAt: -1 }).limit(20).toArray();
      movements = movementDocs.map((m) => ({
        id: m._id.toString(),
        sessionId: m.cashSessionId ? m.cashSessionId.toString() : "",
        direction: m.direction || "out",
        amountCOP: m.amountCOP || 0,
        reason: m.reason || "Gasto menor de caja",
        category: m.sourceType || "egreso_menor",
        createdAt: m.createdAt ? m.createdAt.toISOString() : new Date().toISOString(),
      }));

      // Calcular ventas de pedidos
      const orders = await colOrders.find({}).toArray();
      orders.forEach((o: any) => {
        const total = o.totalCOP || 0;
        totalSalesCOP += total;
        const method = (o.paymentMethod || "").toLowerCase();
        if (method === "cash" || o.notes?.includes("PAGO: cash")) {
          cashSalesCOP += total;
        } else if (method === "credit" || o.paymentStatus === "UNPAID" || o.notes?.includes("FIADO")) {
          creditSalesCOP += total;
        } else {
          // nequi, daviplata, breb, transfer
          transferSalesCOP += total;
        }
      });
    }
  } catch (error) {
    console.warn("[CashService] Fallback a memoria local:", error);
  }

  const openingFloatCOP = currentSession ? currentSession.openingFloatCOP : 0;
  const cashOutflowCOP = movements
    .filter((m) => m.direction === "out")
    .reduce((sum, m) => sum + m.amountCOP, 0);
  const cashInflowCOP = movements
    .filter((m) => m.direction === "in")
    .reduce((sum, m) => sum + m.amountCOP, 0);

  const expectedCashCOP = Math.max(0, openingFloatCOP + cashSalesCOP + cashInflowCOP - cashOutflowCOP);

  return {
    currentSession,
    openingFloatCOP,
    cashSalesCOP,
    transferSalesCOP,
    creditSalesCOP,
    totalSalesCOP,
    cashOutflowCOP,
    cashInflowCOP,
    expectedCashCOP,
    recentMovements: movements,
  };
}

export async function openCashSession(data: { openingFloatCOP: number; openedBy: string; notes?: string }) {
  const newSession: CashSessionData = {
    id: new ObjectId().toString(),
    status: "open",
    openedAt: new Date().toISOString(),
    openedBy: data.openedBy || "Jonathan López",
    openingFloatCOP: data.openingFloatCOP,
    notes: data.notes,
  };

  memorySession = newSession;

  if (!process.env.MONGODB_URI) {
    return newSession;
  }

  try {
    const col = await collections.cashSessions();
    // Cerrar cualquier sesión previa que haya quedado abierta
    await col.updateMany({ status: "open" }, { $set: { status: "closed", closedAt: new Date() } });

    await col.insertOne({
      _id: new ObjectId(newSession.id),
      openedBy: new ObjectId("000000000000000000000000"),
      openedByName: data.openedBy || "Jonathan López",
      openedAt: new Date(),
      openingFloatCOP: data.openingFloatCOP,
      status: "open",
      notes: data.notes,
      branchId: new ObjectId("000000000000000000000000"),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    return newSession;
  } catch (error) {
    console.error("[CashService] Error abriendo caja en DB:", error);
    return newSession;
  }
}

export async function closeCashSession(data: {
  countedCashCOP: number;
  differenceReason?: string;
  closedBy?: string;
}) {
  const summary = await getCashTurnoSummary();
  const expected = summary.expectedCashCOP;
  const diff = data.countedCashCOP - expected;

  if (memorySession) {
    memorySession.status = "closed";
    memorySession.closedAt = new Date().toISOString();
    memorySession.closedBy = data.closedBy || "Jonathan López";
    memorySession.expectedCashCOP = expected;
    memorySession.countedCashCOP = data.countedCashCOP;
    memorySession.differenceCOP = diff;
    memorySession.differenceReason = data.differenceReason;
  }

  if (!process.env.MONGODB_URI) {
    const closed = memorySession;
    memorySession = null;
    return closed;
  }

  try {
    const col = await collections.cashSessions();
    await col.updateOne(
      { status: "open" },
      {
        $set: {
          status: "closed",
          closedAt: new Date(),
          closedByName: data.closedBy || "Jonathan López",
          expectedCashCOP: expected,
          countedCashCOP: data.countedCashCOP,
          differenceCOP: diff,
          differenceReason: data.differenceReason,
          updatedAt: new Date(),
        },
      }
    );
    memorySession = null;
    return true;
  } catch (error) {
    console.error("[CashService] Error cerrando caja en DB:", error);
    return false;
  }
}

export async function addCashMovement(data: {
  direction: "in" | "out";
  amountCOP: number;
  reason: string;
  category: "egreso_menor" | "ingreso_extra" | "pago_domicilio" | "compra_urgente";
}) {
  const mov: CashMovementData = {
    id: new ObjectId().toString(),
    sessionId: memorySession?.id || "session-curr",
    direction: data.direction,
    amountCOP: data.amountCOP,
    reason: data.reason,
    category: data.category,
    createdAt: new Date().toISOString(),
  };

  memoryMovements.unshift(mov);

  if (!process.env.MONGODB_URI) {
    return mov;
  }

  try {
    const col = await collections.cashMovements();
    await col.insertOne({
      _id: new ObjectId(mov.id),
      direction: data.direction,
      amountCOP: data.amountCOP,
      reason: data.reason,
      sourceType: data.category,
      method: "cash",
      branchId: new ObjectId("000000000000000000000000"),
      createdBy: new ObjectId("000000000000000000000000"),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    return mov;
  } catch (error) {
    console.error("[CashService] Error guardando movimiento de caja en DB:", error);
    return mov;
  }
}

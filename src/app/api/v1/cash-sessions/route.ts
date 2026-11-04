import { ok, created, handleError } from "@/server/http/response";
import {
  getCashTurnoSummary,
  openCashSession,
  closeCashSession,
  addCashMovement,
} from "@/server/modules/cash/cash.service";
import { z } from "zod";

const OpenSchema = z.object({
  action: z.literal("open"),
  openingFloatCOP: z.number().int().nonnegative(),
  openedBy: z.string().default("Jonathan López"),
  notes: z.string().optional(),
});

const CloseSchema = z.object({
  action: z.literal("close"),
  countedCashCOP: z.number().int().nonnegative(),
  differenceReason: z.string().optional(),
  closedBy: z.string().default("Jonathan López"),
});

const MovementSchema = z.object({
  action: z.literal("movement"),
  direction: z.enum(["in", "out"]),
  amountCOP: z.number().int().positive(),
  reason: z.string().min(2, "El motivo es requerido"),
  category: z.enum(["egreso_menor", "ingreso_extra", "pago_domicilio", "compra_urgente"]),
});

const ActionSchema = z.discriminatedUnion("action", [OpenSchema, CloseSchema, MovementSchema]);

export async function GET() {
  try {
    const summary = await getCashTurnoSummary();
    return ok(summary);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = ActionSchema.parse(body);

    if (parsed.action === "open") {
      const session = await openCashSession(parsed);
      return created(session);
    } else if (parsed.action === "close") {
      const closed = await closeCashSession(parsed);
      return ok({ closed });
    } else {
      const mov = await addCashMovement(parsed);
      return created(mov);
    }
  } catch (error) {
    return handleError(error);
  }
}

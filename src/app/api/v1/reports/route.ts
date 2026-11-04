import { ok, handleError } from "@/server/http/response";
import { getSalesReport, settleCredit } from "@/server/modules/reports/reports.service";

export async function GET() {
  try {
    const report = await getSalesReport();
    return ok(report);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (body.action === "settle" && body.orderId) {
      await settleCredit(body.orderId);
      return ok({ success: true });
    }
    return handleError(new Error("Acción inválida"));
  } catch (error) {
    return handleError(error);
  }
}

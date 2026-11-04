import { ok, created, handleError } from "@/server/http/response";
import { getSuppliers, createSupplier, deleteSupplier } from "@/server/modules/suppliers/suppliers.service";
import { z } from "zod";

const SupplierSchema = z.object({
  name: z.string().min(2, "El nombre de la empresa o proveedor es obligatorio"),
  taxId: z.string().optional(),
  contactName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  supplyType: z.string().default("Insumos de parrilla"),
  paymentTermsDays: z.number().int().nonnegative().default(0),
  notes: z.string().optional(),
});

export async function GET() {
  try {
    const suppliers = await getSuppliers();
    return ok(suppliers);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = SupplierSchema.parse(body);
    const supplier = await createSupplier({
      ...validated,
      isActive: true,
    });
    return created(supplier);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return handleError(new Error("ID de proveedor requerido"));
    }
    await deleteSupplier(id);
    return ok({ success: true });
  } catch (error) {
    return handleError(error);
  }
}

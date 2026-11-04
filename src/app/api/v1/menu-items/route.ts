import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "@/server/modules/menu/menu.service";
import { ok, created, handleError } from "@/server/http/response";

const CreateProductSchema = z.object({
  sku: z.string().min(2).max(20),
  name: z.string().min(2).max(100),
  category: z.enum(["Individuales", "Combos", "Especiales"]),
  description: z.string().default(""),
  priceCOP: z.number().int().positive("El precio debe ser un número entero positivo en COP"),
});

const UpdateProductSchema = z.object({
  id: z.string().min(1),
  name: z.string().optional(),
  description: z.string().optional(),
  priceCOP: z.number().int().positive().optional(),
  isAvailable: z.boolean().optional(),
});

export async function GET() {
  try {
    const items = await getMenuItems();
    return ok(items);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = CreateProductSchema.parse(body);
    const item = await createMenuItem(validated);
    return created(item);
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updates } = UpdateProductSchema.parse(body);
    await updateMenuItem(id, updates);
    return ok({ success: true, id, updates });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: { message: "ID requerido" } }, { status: 400 });
    }
    await deleteMenuItem(id);
    return ok({ success: true, id });
  } catch (error) {
    return handleError(error);
  }
}

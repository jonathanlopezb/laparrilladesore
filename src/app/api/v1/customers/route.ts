import { NextResponse } from "next/server";
import { z } from "zod";
import { ok, created, handleError } from "@/server/http/response";
import { collections } from "@/server/db/collections";
import { ObjectId } from "mongodb";

const CustomerSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export async function GET() {
  try {
    if (!process.env.MONGODB_URI) {
      return ok([]);
    }
    const col = await collections.customers();
    const docs = await col.find({ isActive: true }).sort({ createdAt: -1 }).toArray();
    return ok(docs);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = CustomerSchema.parse(body);
    const newId = new ObjectId();

    if (process.env.MONGODB_URI) {
      const col = await collections.customers();
      await col.insertOne({
        _id: newId,
        name: validated.name,
        phone: validated.phone,
        notes: validated.address,
        isActive: true,
        branchId: new ObjectId("000000000000000000000000"),
        createdBy: new ObjectId("000000000000000000000000"),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
    }

    return created({ _id: newId.toString(), ...validated });
  } catch (err) {
    return handleError(err);
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, name, phone, address } = body;
    if (!id) {
      return handleError(new Error("ID de cliente requerido"));
    }

    if (process.env.MONGODB_URI) {
      const col = await collections.customers();
      if (ObjectId.isValid(id)) {
        await col.updateOne(
          { _id: new ObjectId(id) } as any,
          {
            $set: {
              ...(name ? { name } : {}),
              ...(phone !== undefined ? { phone } : {}),
              ...(address !== undefined ? { notes: address } : {}),
              updatedAt: new Date(),
            } as any,
          }
        );
      }
    }
    return ok({ success: true, id });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return handleError(new Error("ID de cliente requerido"));
    }

    if (process.env.MONGODB_URI && ObjectId.isValid(id)) {
      const col = await collections.customers();
      await col.updateOne(
        { _id: new ObjectId(id) } as any,
        { $set: { isActive: false, updatedAt: new Date() } as any }
      );
    }
    return ok({ success: true, id });
  } catch (err) {
    return handleError(err);
  }
}

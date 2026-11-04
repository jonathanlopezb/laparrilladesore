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

    if (process.env.MONGODB_URI) {
      const col = await collections.customers();
      await col.insertOne({
        _id: new ObjectId(),
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

    return created(validated);
  } catch (err) {
    return handleError(err);
  }
}

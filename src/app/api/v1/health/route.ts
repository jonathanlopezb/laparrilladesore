import { NextResponse } from "next/server";
import { getDb } from "@/server/db/client";

export async function GET() {
  try {
    const uriConfigured = !!process.env.MONGODB_URI;
    if (!uriConfigured) {
      return NextResponse.json({
        status: "warning",
        message: "MONGODB_URI no está configurada en las variables de entorno",
        mongoConnected: false,
      });
    }

    const db = await getDb();
    const collections = await db.listCollections().toArray();

    return NextResponse.json({
      status: "ok",
      mongoConnected: true,
      database: db.databaseName,
      collections: collections.map((c) => c.name),
      collectionsCount: collections.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        mongoConnected: false,
        error: error.message || String(error),
      },
      { status: 500 }
    );
  }
}

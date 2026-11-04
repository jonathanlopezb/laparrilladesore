import "server-only";
import { ObjectId } from "mongodb";
import { collections } from "@/server/db/collections";
import { OFFICIAL_MENU, type MenuItem } from "@/shared/menu/catalog";

// Memoria volátil de respaldo para previsualizaciones sin MongoDB URI conectada
let memoryProducts: (MenuItem & { _id: string; isAvailable: boolean; isActive: boolean })[] =
  OFFICIAL_MENU.map((item) => ({
    _id: item.sku,
    ...item,
    isAvailable: true,
    isActive: true,
  }));

export async function getMenuItems() {
  try {
    if (!process.env.MONGODB_URI) {
      return memoryProducts.filter((p) => p.isActive);
    }

    const col = await collections.products();
    const count = await col.countDocuments({});

    // Si la colección está vacía, hacer seed automático de los 7 platos
    if (count === 0) {
      const seedDocs = OFFICIAL_MENU.map((item, idx) => ({
        _id: new ObjectId(),
        sku: item.sku,
        name: item.name,
        slug: item.name.toLowerCase().replace(/\s+/g, "-"),
        categoryId: new ObjectId("000000000000000000000001"),
        description: item.description,
        priceCOP: item.priceCOP,
        isActive: true,
        isAvailable: true,
        sortOrder: idx + 1,
        branchId: new ObjectId("000000000000000000000000"),
        createdBy: new ObjectId("000000000000000000000000"),
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      await col.insertMany(seedDocs as any);
    }

    const docs = await col.find({ isActive: true }).sort({ sortOrder: 1 }).toArray();

    return docs.map((d) => ({
      _id: d._id.toString(),
      sku: d.sku,
      name: d.name,
      category: d.sku.startsWith("ESP")
        ? "Especiales"
        : d.sku.startsWith("COM")
        ? "Combos"
        : "Individuales",
      description: d.description || "",
      priceCOP: d.priceCOP,
      accompaniments: "Papa, ensalada y salsa de la casa",
      isAvailable: d.isAvailable ?? true,
      isActive: d.isActive ?? true,
    }));
  } catch (error) {
    console.warn("[MenuService] Fallback a memoria local:", error);
    return memoryProducts.filter((p) => p.isActive);
  }
}

export async function createMenuItem(data: {
  sku: string;
  name: string;
  category: "Individuales" | "Combos" | "Especiales";
  description: string;
  priceCOP: number;
}) {
  try {
    if (!process.env.MONGODB_URI) {
      const newItem = {
        _id: data.sku,
        ...data,
        accompaniments: "Papa, ensalada y salsa de la casa",
        isAvailable: true,
        isActive: true,
      };
      memoryProducts.push(newItem);
      return newItem;
    }

    const col = await collections.products();
    const doc = {
      _id: new ObjectId(),
      sku: data.sku,
      name: data.name,
      slug: data.name.toLowerCase().replace(/\s+/g, "-"),
      categoryId: new ObjectId("000000000000000000000001"),
      description: data.description,
      priceCOP: data.priceCOP,
      isActive: true,
      isAvailable: true,
      sortOrder: 99,
      branchId: new ObjectId("000000000000000000000000"),
      createdBy: new ObjectId("000000000000000000000000"),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await col.insertOne(doc as any);
    return { ...data, _id: doc._id.toString(), isAvailable: true, isActive: true };
  } catch (error) {
    console.warn("[MenuService] Error creando plato en DB, usando memoria:", error);
    const newItem = {
      _id: data.sku,
      ...data,
      accompaniments: "Papa, ensalada y salsa de la casa",
      isAvailable: true,
      isActive: true,
    };
    memoryProducts.push(newItem);
    return newItem;
  }
}

export async function updateMenuItem(
  id: string,
  updates: {
    priceCOP?: number;
    isAvailable?: boolean;
    name?: string;
    description?: string;
  }
) {
  try {
    if (!process.env.MONGODB_URI) {
      memoryProducts = memoryProducts.map((p) =>
        p._id === id || p.sku === id ? { ...p, ...updates } : p
      );
      return true;
    }

    const col = await collections.products();
    const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { sku: id };
    await col.updateOne(query, {
      $set: { ...updates, updatedAt: new Date() },
    });
    return true;
  } catch (error) {
    console.warn("[MenuService] Error actualizando plato:", error);
    memoryProducts = memoryProducts.map((p) =>
      p._id === id || p.sku === id ? { ...p, ...updates } : p
    );
    return true;
  }
}

export async function deleteMenuItem(id: string) {
  try {
    if (!process.env.MONGODB_URI) {
      memoryProducts = memoryProducts.filter((p) => p._id !== id && p.sku !== id);
      return true;
    }

    const col = await collections.products();
    const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { sku: id };
    await col.updateOne(query, {
      $set: { isActive: false, updatedAt: new Date() },
    });
    return true;
  } catch (error) {
    console.warn("[MenuService] Error eliminando plato:", error);
    memoryProducts = memoryProducts.filter((p) => p._id !== id && p.sku !== id);
    return true;
  }
}

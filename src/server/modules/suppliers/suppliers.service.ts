import "server-only";
import { ObjectId } from "mongodb";
import { collections } from "@/server/db/collections";

export interface SupplierItem {
  id: string;
  name: string;
  taxId?: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  supplyType: string;
  paymentTermsDays: number;
  notes?: string;
  isActive: boolean;
  createdAt?: string;
}

const DEFAULT_SUPPLIERS: Omit<SupplierItem, "id">[] = [
  {
    name: "Avícola La Granja Campesina",
    taxId: "900.845.120-1",
    contactName: "Don Hernán Castro",
    phone: "3104509823",
    email: "pedidos@avicolalaganja.co",
    address: "Central de Abastos Bodega 4",
    supplyType: "Pollo fresco y presas",
    paymentTermsDays: 7,
    notes: "Entrega martes y viernes antes de las 9:00 AM",
    isActive: true,
  },
  {
    name: "Carnes y Derivados El Parrillero",
    taxId: "901.233.456-8",
    contactName: "Mauricio Restrepo",
    phone: "3127891234",
    email: "ventas@elparrillero.com",
    address: "Calle 45 # 18-32",
    supplyType: "Chuleta de cerdo y chorizo santarrosano",
    paymentTermsDays: 15,
    notes: "Chorizo artesanal ahumado especial para brasa",
    isActive: true,
  },
  {
    name: "Distribuidora Agrícola Sabana Verde",
    taxId: "900.567.890-3",
    contactName: "Gloria Amparo",
    phone: "3146543210",
    email: "sabanaverde@gmail.com",
    address: "Pabellón Hortalizas Local 12",
    supplyType: "Papa pastusa, criolla y verduras para ensalada",
    paymentTermsDays: 0,
    notes: "Pago contra entrega en efectivo o Nequi",
    isActive: true,
  },
  {
    name: "Distribuidora de Bebidas y Refrescos",
    taxId: "860.000.123-5",
    contactName: "Ramiro Gómez (Preventista)",
    phone: "3201112233",
    email: "preventa@distribebidas.co",
    address: "Zona Industrial Los Álamos",
    supplyType: "Gaseosas, jugos y aguas",
    paymentTermsDays: 8,
    notes: "Visita de preventa los días miércoles",
    isActive: true,
  },
  {
    name: "Carbones y Biomasa San Jorge",
    taxId: "79.845.612",
    contactName: "Jorge Pinzón",
    phone: "3189988776",
    email: "carbonessanjorge@gmail.com",
    address: "Km 4 Vía Suba Cota",
    supplyType: "Carbón vegetal de encenillo y guayacán",
    paymentTermsDays: 0,
    notes: "Bultos de 20 kg alta durabilidad",
    isActive: true,
  },
];

let memorySuppliers: SupplierItem[] = DEFAULT_SUPPLIERS.map((s, idx) => ({
  ...s,
  id: `sup-${idx + 1}`,
  createdAt: new Date().toISOString(),
}));

export async function getSuppliers(): Promise<SupplierItem[]> {
  try {
    if (!process.env.MONGODB_URI) {
      return memorySuppliers;
    }

    const col = await collections.suppliers();
    const count = await col.countDocuments();

    // Auto-seed si la colección está vacía
    if (count === 0) {
      const docsToInsert = DEFAULT_SUPPLIERS.map((s) => ({
        ...s,
        _id: new ObjectId(),
        branchId: new ObjectId("000000000000000000000000"),
        createdBy: new ObjectId("000000000000000000000000"),
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      await col.insertMany(docsToInsert as any);
    }

    const docs = await col.find({ isActive: true }).sort({ name: 1 }).toArray();

    return docs.map((d) => ({
      id: d._id.toString(),
      name: d.name,
      taxId: d.taxId,
      contactName: d.contactName,
      phone: d.phone,
      email: d.email,
      address: d.address,
      supplyType: d.supplyType || "General",
      paymentTermsDays: d.paymentTermsDays || 0,
      notes: d.notes,
      isActive: d.isActive !== false,
      createdAt: d.createdAt ? d.createdAt.toISOString() : undefined,
    }));
  } catch (error) {
    console.warn("[SuppliersService] Fallback a memoria local:", error);
    return memorySuppliers;
  }
}

export async function createSupplier(data: Omit<SupplierItem, "id">): Promise<SupplierItem> {
  const newItem: SupplierItem = {
    ...data,
    id: new ObjectId().toString(),
    createdAt: new Date().toISOString(),
    isActive: true,
  };

  memorySuppliers.unshift(newItem);

  if (!process.env.MONGODB_URI) {
    return newItem;
  }

  try {
    const col = await collections.suppliers();
    const doc = {
      _id: new ObjectId(newItem.id),
      name: data.name,
      taxId: data.taxId,
      contactName: data.contactName,
      phone: data.phone,
      email: data.email,
      address: data.address,
      supplyType: data.supplyType,
      paymentTermsDays: Number(data.paymentTermsDays || 0),
      notes: data.notes,
      isActive: true,
      branchId: new ObjectId("000000000000000000000000"),
      createdBy: new ObjectId("000000000000000000000000"),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await col.insertOne(doc as any);
    return newItem;
  } catch (error) {
    console.error("[SuppliersService] Error creando proveedor en DB:", error);
    return newItem;
  }
}

export async function deleteSupplier(id: string): Promise<boolean> {
  memorySuppliers = memorySuppliers.filter((s) => s.id !== id);

  if (!process.env.MONGODB_URI) {
    return true;
  }

  try {
    const col = await collections.suppliers();
    if (ObjectId.isValid(id)) {
      await col.updateOne({ _id: new ObjectId(id) }, { $set: { isActive: false, updatedAt: new Date() } });
    }
    return true;
  } catch (error) {
    console.error("[SuppliersService] Error eliminando proveedor en DB:", error);
    return false;
  }
}

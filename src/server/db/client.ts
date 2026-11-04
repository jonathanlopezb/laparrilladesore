/**
 * src/server/db/client.ts
 * MongoDB connection singleton — server-only.
 * Never import this in browser components or client code.
 */
import "server-only";
import { MongoClient, type Db } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error(
    "MONGODB_URI no está definida. Agrega el valor en .env.local."
  );
}

if (!process.env.MONGODB_DB) {
  throw new Error(
    "MONGODB_DB no está definida. Agrega el nombre de la base de datos en .env.local."
  );
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

// Opciones del pool — ajustar según carga real medida
const options = {
  maxPoolSize: 10,
  minPoolSize: 1,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

// Reutilizar el MongoClient entre invocaciones de funciones Vercel
// En desarrollo, Next.js recarga módulos con HMR, por lo que usamos
// un global para evitar conexiones duplicadas.

declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined;
}

let client: MongoClient;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClient) {
    global._mongoClient = new MongoClient(uri, options);
  }
  client = global._mongoClient;
} else {
  client = new MongoClient(uri, options);
}

export async function getDb(): Promise<Db> {
  await client.connect();
  return client.db(dbName);
}

export async function getClient(): Promise<MongoClient> {
  await client.connect();
  return client;
}

export { client };

/**
 * src/server/db/client.ts
 * MongoDB connection singleton — server-only.
 * Never import this in browser components or client code.
 */
import "server-only";
import { MongoClient, type Db } from "mongodb";

const options = {
  maxPoolSize: 10,
  minPoolSize: 1,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined;
}

function initClient(): MongoClient {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI no está definida. Configúrala en las variables de entorno."
    );
  }

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClient) {
      global._mongoClient = new MongoClient(uri, options);
    }
    return global._mongoClient;
  }
  return new MongoClient(uri, options);
}

export async function getClient(): Promise<MongoClient> {
  const client = initClient();
  await client.connect();
  return client;
}

export async function getDb(): Promise<Db> {
  const dbName = process.env.MONGODB_DB;
  if (!dbName) {
    throw new Error(
      "MONGODB_DB no está definida. Configúrala en las variables de entorno."
    );
  }
  const client = await getClient();
  return client.db(dbName);
}

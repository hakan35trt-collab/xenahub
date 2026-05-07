import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_PUBLIC_URL || process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://localhost:27017/xenahub';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectDB(): Promise<Db> {
  if (db) return db;
  try {
    client = new MongoClient(MONGO_URI);
    await client.connect();
    db = client.db();
    console.log(`[MONGO] Connected to ${db.databaseName}`);
    return db;
  } catch (err) {
    console.error('[MONGO] Connection failed:', err);
    throw err;
  }
}

export function getDB(): Db {
  if (!db) throw new Error('Database not connected');
  return db;
}

export async function closeDB(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

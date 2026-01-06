import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://yousafijazoffical_db_user:sWbL9SYdhEX1e7v4@cluster0.qtjnojc.mongodb.net/";
const DB_NAME = process.env.DB_NAME || "ecom";

let client = null;
let db = null;

export async function connectDB() {
  try {
    if (!client) {
      client = new MongoClient(MONGODB_URI);
      await client.connect();
      db = client.db(DB_NAME);
      console.log("✅ Connected to MongoDB");
    }
    return db;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
}

export async function closeDB() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log("✅ MongoDB connection closed");
  }
}

export function getDB() {
  if (!db) {
    throw new Error("Database not connected. Call connectDB() first.");
  }
  return db;
}

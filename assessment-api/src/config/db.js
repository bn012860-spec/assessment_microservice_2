import mongoose from "mongoose";
import { MongoClient, ServerApiVersion } from "mongodb";
import { env } from "./env.js";

const client = new MongoClient(env.MONGO_URI, {
  serverSelectionTimeoutMS: 3000,
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export default async function connectDB() {
  await client.connect();
  await client.db("admin").command({ ping: 1 });
  console.log("✅ Connected to MongoDB via MongoClient");

  await mongoose.connect(env.MONGO_URI, {
    dbName: "assessment_db",
    serverSelectionTimeoutMS: 3000
  });
  console.log("✅ Connected to MongoDB via Mongoose");
}

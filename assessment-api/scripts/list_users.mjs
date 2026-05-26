import mongoose from "mongoose";
import User from "../models/User.mjs";

const MONGO_URI = process.env.MONGO_URI || "mongodb://mongo:27017/assessment_db";

async function listUsers() {
  try {
    await mongoose.connect(MONGO_URI);
    const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 });
    
    console.log(`\nFound ${users.length} users:\n`);
    console.log("----------------------------------------------------------------------------------");
    console.log(`${"ID".padEnd(26)} | ${"Name".padEnd(20)} | ${"Email".padEnd(25)} | ${"Role"}`);
    console.log("----------------------------------------------------------------------------------");
    
    users.forEach(u => {
      console.log(`${u._id.toString().padEnd(26)} | ${u.name.padEnd(20)} | ${u.email.padEnd(25)} | ${u.role}`);
    });
    console.log("----------------------------------------------------------------------------------\n");

  } catch (error) {
    console.error("Error listing users:", error.message);
  } finally {
    await mongoose.connection.close();
  }
}

listUsers();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.mjs";

const MONGO_URI = process.env.MONGO_URI || "mongodb://mongo:27017/assessment_db";

async function createUser() {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.log("Usage: node create_user.mjs <name> <email> <password> [role]");
    process.exit(1);
  }

  const [name, email, password, role = "student"] = args;

  try {
    await mongoose.connect(MONGO_URI);

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      console.error(`Error: User with email ${email} already exists.`);
      process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role
    });

    console.log(`\n✅ User created successfully:`);
    console.log(`ID:    ${user._id}`);
    console.log(`Name:  ${user.name}`);
    console.log(`Email: ${user.email}`);
    console.log(`Role:  ${user.role}\n`);

  } catch (error) {
    console.error("Error creating user:", error.message);
  } finally {
    await mongoose.connection.close();
  }
}

createUser();

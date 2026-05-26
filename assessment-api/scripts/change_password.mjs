import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.mjs";

const MONGO_URI = process.env.MONGO_URI || "mongodb://mongo:27017/assessment_db";

async function changePassword() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log("Usage: node change_password.mjs <email> <new_password>");
    process.exit(1);
  }

  const [email, newPassword] = args;

  try {
    await mongoose.connect(MONGO_URI);

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.error(`Error: User with email ${email} not found.`);
      process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    console.log(`\n✅ Password updated successfully for user: ${user.email}\n`);

  } catch (error) {
    console.error("Error changing password:", error.message);
  } finally {
    await mongoose.connection.close();
  }
}

changePassword();

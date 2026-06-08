import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/assessment_db';
const HARNESS_EMAIL = process.env.HARNESS_EMAIL || 'judge-harness@example.com';
const HARNESS_PASSWORD = process.env.HARNESS_PASSWORD || 'HarnessPass123!';
const HARNESS_NAME = process.env.HARNESS_NAME || 'Judge Harness';

async function main() {
  await mongoose.connect(MONGO_URI, { dbName: 'assessment_db', serverSelectionTimeoutMS: 10000 });
  console.log('Connected to MongoDB');
  const users = mongoose.connection.collection('users');

  const email = HARNESS_EMAIL.toLowerCase();
  const hashed = await bcrypt.hash(HARNESS_PASSWORD, 10);

  const existing = await users.findOne({ email });
  if (existing) {
    const res = await users.updateOne({ email }, { $set: { password: hashed, name: HARNESS_NAME, role: 'faculty' } });
    console.log('Updated existing user:', email);
  } else {
    const now = new Date();
    const doc = { name: HARNESS_NAME, email, password: hashed, role: 'faculty', createdAt: now, updatedAt: now };
    const r = await users.insertOne(doc);
    console.log('Inserted harness user id:', r.insertedId.toString());
  }
  process.exit(0);
}

main().catch(err => {
  console.error('Failed to create harness user:', err);
  process.exit(1);
});

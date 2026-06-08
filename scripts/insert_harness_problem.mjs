import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/assessment_db';

const TEST_PROBLEM = {
  title: 'Harness: Two Sum',
  description: 'E2E harness problem for validating judge verdicts.',
  difficulty: 'Easy',
  functionName: 'twoSum',
  parameters: [
    { name: 'nums', type: 'array<number>' },
    { name: 'target', type: 'number' }
  ],
  returnType: 'array<number>',
  compareConfig: { mode: 'EXACT', floatTolerance: 0, orderInsensitive: false },
  testCases: [
    { inputs: [[2,7,11,15], 9], expected: [0,1], isSample: true, isHidden: false },
    { inputs: [[3,2,4], 6], expected: [1,2], isSample: false, isHidden: true }
  ],
  tags: ['array', 'two-sum']
};

async function main(){
  await mongoose.connect(MONGO_URI, { dbName: 'assessment_db', serverSelectionTimeoutMS: 10000 });
  console.log('Connected to MongoDB');
  const problems = mongoose.connection.collection('problems');
  const existing = await problems.findOne({ title: TEST_PROBLEM.title });
  if (existing) {
    await problems.updateOne({ _id: existing._id }, { $set: { ...TEST_PROBLEM, updatedAt: new Date() } });
    console.log('Updated existing problem');
  } else {
    await problems.insertOne({ ...TEST_PROBLEM, createdAt: new Date(), updatedAt: new Date() });
    console.log('Inserted test problem');
  }
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });

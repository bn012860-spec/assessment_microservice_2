import amqp from 'amqplib';
import mongoose from 'mongoose';
import Submission from './models/Submission.mjs';
import Problem from './models/Problem.mjs';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/assessment_db';
const RABBITMQ_URI = process.env.RABBITMQ_URI || 'amqp://user:password@localhost:5672';
const QUEUE_NAME = process.env.SUBMISSION_QUEUE || 'submission_queue';

const WAIT_TIMEOUT_MS = 30000;
const POLL_INTERVAL_MS = 1000;

const PROBLEMS = [
  {
    title: 'Go Medium: Reverse Linked List',
    description: 'Reverse linked list.',
    difficulty: 'Medium',
    functionName: 'reverseList',
    parameters: [
      { name: 'head', type: 'linkedlist<number>' }
    ],
    returnType: 'linkedlist<number>',
    testCases: [
      { inputs: [[1, 2, 3]], expected: [3, 2, 1], isHidden: false },
      { inputs: [[]], expected: [], isHidden: true }
    ],
    solution: `func reverseList(head *ListNode) *ListNode {
    if head == nil || head.Next == nil {
        return head
    }
    newHead := reverseList(head.Next)
    head.Next.Next = head
    head.Next = nil
    return newHead
}`
  }
];

async function upsertProblem(problem) {
  const doc = {
    title: problem.title,
    description: problem.description,
    difficulty: problem.difficulty,
    functionName: problem.functionName,
    parameters: problem.parameters,
    returnType: problem.returnType,
    testCases: problem.testCases,
    tags: ['go-test'],
    isPremium: false
  };

  const existing = await Problem.findOne({ title: problem.title });
  if (existing) {
    await Problem.updateOne({ _id: existing._id }, { $set: doc });
    return Problem.findById(existing._id);
  }
  return Problem.create(doc);
}

function resolveFunctionName(problemDoc) {
  return problemDoc.functionName;
}

async function waitForResult(submissionId) {
  const start = Date.now();
  while (Date.now() - start < WAIT_TIMEOUT_MS) {
    const result = await Submission.findById(submissionId);
    if (!result) return { status: 'Error', message: 'submission not found' };
    if (result.status && result.status !== 'Pending' && result.status !== 'Running') {
      return result;
    }
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));
  }
  return { status: 'Error', message: `timeout after ${WAIT_TIMEOUT_MS}ms` };
}

async function submitAndVerify(problem, problemDoc, channel) {
  const submission = await Submission.create({
    problemId: problemDoc._id,
    userId: new mongoose.Types.ObjectId(),
    language: 'go',
    code: problem.solution,
    status: 'Pending'
  });

  const messageBody = {
    schemaVersion: 'v2',
    submissionId: submission._id.toString(),
    problemId: problemDoc._id.toString(),
    language: 'go',
    code: problem.solution,
    tests: problemDoc.testCases,
    functionName: resolveFunctionName(problemDoc)
  };

  channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(messageBody)), { persistent: true });
  console.log(`📥 ${problem.difficulty} submission queued: ${submission._id}`);

  const result = await waitForResult(submission._id);
  const passed = result?.status === 'Success' || result?.status === 'Accepted';
  const summary = {
    title: problem.title,
    difficulty: problem.difficulty,
    status: result?.status || 'Unknown',
    passedTests: result?.testResult?.passed,
    totalTests: result?.testResult?.total
  };

  return { passed, summary, result };
}

async function testGoSubmissions() {
  let connection;
  let channel;
  try {
    await mongoose.connect(MONGO_URI, { dbName: 'assessment_db' });
    console.log('✅ Connected to MongoDB');

    connection = await amqp.connect(RABBITMQ_URI);
    channel = await connection.createChannel();
    console.log('✅ Connected to RabbitMQ');

    const results = [];

    for (const problem of PROBLEMS) {
      const problemDoc = await upsertProblem(problem);
      console.log(`✅ ${problem.difficulty} problem ready: ${problemDoc.title}`);
      const run = await submitAndVerify(problem, problemDoc, channel);
      results.push(run);
      console.log(`✅ ${problem.difficulty} result:`, run.summary);
    }

    const failed = results.filter(r => !r.passed);
    if (failed.length > 0) {
      console.error('❌ Some Go submissions failed:');
      for (const f of failed) {
        console.error(f.summary);
        if (f.result?.testResult?.details) {
          console.error(JSON.stringify(f.result.testResult.details, null, 2));
        }
      }
      process.exitCode = 1;
    } else {
      console.log('✅ All Go submissions passed');
    }
  } catch (err) {
    console.error('❌ Test script error:', err);
    process.exitCode = 1;
  } finally {
    if (channel) await channel.close();
    if (connection) await connection.close();
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
  }
}

testGoSubmissions();

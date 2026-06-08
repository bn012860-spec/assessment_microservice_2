import amqp from 'amqplib';

const RABBITMQ_URI = process.env.RABBITMQ_URI || 'amqp://user:password@localhost:5672';
const QUEUE_NAME = 'submission_queue';
const DLQ_NAME = 'submission_dead_letters';

async function testDLQ() {
  let connection;
  try {
    console.log(`Connecting to RabbitMQ at ${RABBITMQ_URI}...`);
    connection = await amqp.connect(RABBITMQ_URI);
    const channel = await connection.createChannel();

    // 1. Check current DLQ count
    const dlqInfoBefore = await channel.assertQueue(DLQ_NAME, { durable: true });
    console.log(`Initial DLQ message count: ${dlqInfoBefore.messageCount}`);

    // 2. Publish a "poison pill" (malformed JSON)
    console.log(`Publishing malformed message to ${QUEUE_NAME}...`);
    const poisonPill = "THIS_IS_NOT_JSON";
    channel.sendToQueue(QUEUE_NAME, Buffer.from(poisonPill), { persistent: true });

    console.log("Waiting for processing (5 seconds)...");
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 3. Check DLQ count again
    const dlqInfoAfter = await channel.assertQueue(DLQ_NAME, { durable: true });
    console.log(`Final DLQ message count: ${dlqInfoAfter.messageCount}`);

    if (dlqInfoAfter.messageCount > dlqInfoBefore.messageCount) {
      console.log("✅ SUCCESS: Malformed message was routed to the DLQ!");
    } else {
      console.log("❌ FAILURE: DLQ count did not increase. Check judge logs.");
    }

  } catch (err) {
    console.error("Test failed with error:", err);
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

testDLQ();

import amqp from "amqplib";

const run = async () => {
  const QUEUE = "priority_tasks";

  const connection = await amqp.connect("amqp://admin:admin123@localhost:5672");

  const channel = await connection.createChannel();

  await channel.assertQueue("priority_tasks", {
    durable: true,
    arguments: {
      "x-max-priority": 10,
    },
  });

  console.log("Waiting for messages...");

  channel.consume(QUEUE, (msg) => {
    if (!msg) return;

    console.log("Received:", msg.content.toString());

    channel.ack(msg);
  });
};

run();

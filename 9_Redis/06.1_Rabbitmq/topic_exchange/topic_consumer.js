import amqp, { connect } from "amqplib";

const EXCHANGE = "topic_logs";

const run = async (name) => {
  const connection = await amqp.connect("amqp://admin:admin123@localhost:5672");
  const channel = await connection.createChannel();
  await channel.assertExchange(EXCHANGE, "topic", { durable: true });

  const q1 = await channel.assertQueue("order_events");
  const q2 = await channel.assertQueue("user_events");

  await channel.bindQueue(q1.queue, EXCHANGE, "order.*");
  await channel.bindQueue(q2.queue, EXCHANGE, "*.signup");

  console.log(`${name} waiting for topic logs...`);

  channel.consume(q1.queue, (msg) => {
    console.log(
      `[Order] got: ${msg.fields.routingKey}:${msg.content.toString()}`,
    );
  });
  channel.consume(q2.queue, (msg) => {
    console.log(
      `[User] got: ${msg.fields.routingKey}:${msg.content.toString()}`,
    );
  });
};

run();

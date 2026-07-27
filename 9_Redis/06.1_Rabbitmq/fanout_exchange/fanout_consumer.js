import amqp, { connect } from "amqplib";

const EXCHANGE = "broadcast-exchange";

const run = async (name) => {
  const connection = await amqp.connect("amqp://admin:admin123@localhost:5672");
  const channel = await connection.createChannel();
  await channel.assertExchange(EXCHANGE, "fanout", { durable: true });
  const q = await channel.assertQueue("", { exclusive: true });

  await channel.bindQueue(q.queue, EXCHANGE, "");

  console.log(`${name} waiting for broadcast...`);

  channel.consume(q.queue, (msg) => {
    console.log(`[${name}] got: ${msg.content.toString()}`);
  });
};

run("Notification service");
run("Email service");

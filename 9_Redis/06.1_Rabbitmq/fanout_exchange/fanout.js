import amqp, { connect } from "amqplib";

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const EXCHANGE = "broadcast-exchange";

const run = async () => {
  const connection = await amqp.connect("amqp://admin:admin123@localhost:5672");
  const channel = await connection.createChannel();

  await channel.assertExchange(EXCHANGE, "fanout", { durable: true });

  const messages = [
    "New Product launch",
    "Big sale Starting Soon!",
    "New Category Added",
  ];

  console.log("\n Fanout Exchange Demo Started - sending every 10 seconds");

  for (const msg of messages) {
    await sleep(10000);
    channel.publish(EXCHANGE, "", Buffer.from(msg));
    console.log(`Broadcasted ${msg}`);
  }
};

run();

import amqp from "amqplib";

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const EXCHANGE = "direct_logs";

const run = async () => {
  console.log("CONNECTING WITH ADMIN USER");
  const connection = await amqp.connect("amqp://admin:admin123@localhost:5672");
  const channel = await connection.createChannel();

  await channel.assertExchange(EXCHANGE, "direct", { durable: true });

  const messages = [
    { key: "info", msg: "info log message" },
    { key: "warn", msg: "warn log message" },
    { key: "error", msg: "error log message" },
  ];

  console.log("\n DIRECT Exchange Demo started - sending every 10 seconds");

  for (const { key, msg } of messages) {
    await sleep(5000);
    channel.publish(EXCHANGE, key, Buffer.from(msg));
  }
  console.log("\n All messages sent. closing connection");
  setTimeout(() => {
    connection.close();
  }, 500);
};

run();

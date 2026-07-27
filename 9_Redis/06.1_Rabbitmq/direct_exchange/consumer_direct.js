import amqp from "amqplib";

const EXCHANGE = "direct_logs";

const run = async () => {
  console.log("CONNECTING WITH ADMIN USER");
  const connection = await amqp.connect("amqp://admin:admin123@localhost:5672");
  const channel = await connection.createChannel();

  await channel.assertExchange(EXCHANGE, "direct", { durable: true });

  // declare three queue
  await channel.assertQueue("info_logs");
  await channel.assertQueue("warn_logs");
  await channel.assertQueue("error_logs");

  // Bind each queue with matching routing keys
  await channel.bindQueue("info_logs", EXCHANGE, "info");
  await channel.bindQueue("warn_logs", EXCHANGE, "warn");
  await channel.bindQueue("error_logs", EXCHANGE, "error");

  console.log("waiting for direct log messages ...");

  // consumer for each queue
  await channel.consume("info_logs", (msg) => {
    console.log(`[INFO] ${msg.content.toString()}`);
    channel.ack(msg);
  });
  await channel.consume("warn_logs", (msg) => {
    console.log(`[WARN] ${msg.content.toString()}`);
    channel.ack(msg);
  });
  await channel.consume("error_logs", (msg) => {
    console.log(`[ERROR] ${msg.content.toString()}`);
    channel.ack(msg);
  });
};

run();

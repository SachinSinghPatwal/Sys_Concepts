import amqp, { connect } from "amqplib";

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const EXCHANGE = "headers_exchange";

const run = async () => {
  const connection = await amqp.connect("amqp://admin:admin123@localhost:5672");
  const channel = await connection.createChannel();

  await channel.assertExchange(EXCHANGE, "headers", { durable: true });

  await channel.assertQueue("Indian_alert");
  await channel.assertQueue("Us_alert");

  await channel.bindQueue("Indian_alert", EXCHANGE, "", {
    "x-match": "all",
    region: "IN",
    type: "alert",
  });
  await channel.bindQueue("Us_alert", EXCHANGE, "", {
    "x-match": "any",
    region: "US",
    type: "info",
  });
  console.log("Waiting for header-based messages...");

  setTimeout(() => connection.close(), 500);
};

run();

import amqp, { connect } from "amqplib";

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const EXCHANGE = "headers_exchange";

const run = async () => {
  const connection = await amqp.connect("amqp://admin:admin123@localhost:5672");
  const channel = await connection.createChannel();

  await channel.assertExchange(EXCHANGE, "headers", { durable: true });

  channel.publish(EXCHANGE, "", Buffer.from("Alerting User"), {
    headers: { region: "IN", type: "alert" },
  });
  channel.publish(EXCHANGE, "", Buffer.from("User Info"), {
    headers: { region: "US", type: "info" },
  });
  console.log("Sent header-based messages.");

  setTimeout(() => connection.close(), 500);
};

run();

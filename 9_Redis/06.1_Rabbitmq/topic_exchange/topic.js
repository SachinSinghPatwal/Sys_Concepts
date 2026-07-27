import amqp, { connect } from "amqplib";

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const EXCHANGE = "topic_logs";

const run = async () => {
  const connection = await amqp.connect("amqp://admin:admin123@localhost:5672");
  const channel = await connection.createChannel();

  await channel.assertExchange(EXCHANGE, "topic", { durable: true });

  const messages = [
    { key: "order.created", msg: "Order Created" },
    { key: "order.cancelled", msg: "Order Cancelled" },
    { key: "user.signup", msg: "User Signed Up" },
  ];

  messages.forEach(({ key, msg }) => {
    channel.publish(EXCHANGE, key, Buffer.from(msg));
    console.log(`Sent [${key}]:${msg}`);
  });

  setTimeout(() => connection.close(), 500);
};

run();

import amqp from "amqplib";

const run = async () => {
  const QUEUE = "priority_tasks";
  const connection = await amqp.connect("amqp://admin:admin123@localhost:5672");
  const channel = await connection.createChannel();

  await channel.assertQueue(QUEUE, {
    durable: true,
    arguments: { "x-max-priority": 10 },
  });

  const tasks = [
    { msg: "Task A (Low Priority)", priority: 1 },
    { msg: "Task B (High Priority)", priority: 9 },
    { msg: "Task C (Medium Priority)", priority: 5 },
    { msg: "Task D (Very High Priority)", priority: 10 },
    { msg: "Task E (Normal Priority)", priority: 3 },
  ];

  console.log("\n Priority Queue Demo - sending all messages immediately");

  for (const task of tasks) {
    channel.sendToQueue(QUEUE, Buffer.from(task.msg), {
      persistent: true,
      priority: task.priority,
    });
    console.log(`Sent:${task.msg} (priority:${task.priority})`);
  }
  console.log("\n all messages sent. Closing Connection ...");
};

run();

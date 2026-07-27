import express from "express";
import Redis from "ioredis";

const app = express();
app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

const QUEUE_KEY = "queue:emails";

app.post("/send-email", async (req, res) => {
  const job = {
    to: req.body.to,
    subject: req.body.subject || "No Subject",
    body: req.body.body,
    createdAt: new Date().toISOString(),
  };
  await redis.lpush(QUEUE_KEY, JSON.stringify(job));
  res.status(200).json({ queue: "Email job added to queue", job });
});

app.get("/queue-length", async (req, res) => {
  const length = await redis.llen(QUEUE_KEY);
  res.status(200).json({ queueLength: length });
});

app.get("/email/process-one", async (req, res) => {
  const rawJob = await redis.rpop(QUEUE_KEY);
  if (!rawJob) {
    return res.status(200).json({ message: "No email jobs in the queue" });
  }
  const job = JSON.parse(rawJob);
  // simulate email sending
  res.status(200).json({ job });
});

app.listen(3000, () => {
  console.log("Server is running on port http://localhost:3000");
});

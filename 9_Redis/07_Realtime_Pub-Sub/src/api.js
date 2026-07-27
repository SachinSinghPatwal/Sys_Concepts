import Redis from "ioredis";
import express from "express";

const app = express();
app.use(express.json());

const publisher = Redis(process.env.REDIS_URL || "redis://localhost:6379");

app.post("/notification", (req, res) => {
  const payload = {
    title: req.body.title,
    message: req.body.message,
    createdAt: new Date(),
  };
  const receiver = publisher.publish("notification", JSON.stringify(payload));
  res.status(200).send("Notification published");
});

app.listen(3000, () => {
  console.log("API server is running on port 3000");
});

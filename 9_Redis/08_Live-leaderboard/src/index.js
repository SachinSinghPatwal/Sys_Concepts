import express from "express";
import Redis from "ioredis";

const app = express();
app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

app.post("/post/:id/view", async (req, res) => {
  await redis.zincrby("post_views", 1, req.params.id);
  res.sendStatus(200);
});

app.post("/leaderboard/score", async (req, res) => {
  await redis.zincrby("leaderboard", req.body.score, req.body.userId);
  res.sendStatus(200);
});

app.get("/leaderboard", async (req, res) => {
  const leaderboard = await redis.zrevrange("leaderboard", 0, -1, "WITHSCORES");
  const formattedLeaderboard = [];
  for (let i = 0; i < leaderboard.length; i += 2) {
    formattedLeaderboard.push({
      userId: leaderboard[i],
      score: parseInt(leaderboard[i + 1], 10),
    });
  }
  res.json(formattedLeaderboard);
});

app.get("/leaderboard/:userId/rank", async (req, res) => {
  const rank = await redis.zrevrank("leaderboard", req.params.userId);
  res.json({ rank: rank !== null ? rank + 1 : null });
});

app.listen(3000, () => {
  console.log("Server is running on port http://localhost:3000");
});

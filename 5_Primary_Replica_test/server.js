const express = require("express");
const { primaryPool, replicaPool } = require("./db/Db");

const app = express();

app.use(express.json());

app.get("/messages", async (req, res) => {
  try {
    const result = await replicaPool.query("SELECT * FROM replica_test");

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Read failed" });
  }
});

app.post("/messages", async (req, res) => {
  try {
    const { message } = req.body;

    const result = await primaryPool.query(
      `
      INSERT INTO replica_test(message)
      VALUES ($1)
      RETURNING *
      `,
      [message],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

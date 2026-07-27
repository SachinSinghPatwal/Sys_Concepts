import express from "express";

const app = express();

app.use(express.json());

app.use((req, res) => {
  console.log("received by backend 3 sending response .... \n");
  res.json({
    server: "Backend 3",
    path: req.originalUrl,
    method: req.method,
  });
});

app.listen(3003, () => {
  console.log("Backend 3 is listening 3003 \n");
});

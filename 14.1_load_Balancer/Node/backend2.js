import express from "express";

const app = express();

app.use(express.json());

app.use((req, res) => {
  console.log("received by backend 2 sending response .... \n");
  res.json({
    server: "Backend 2",
    path: req.originalUrl,
    method: req.method,
  });
});

app.listen(3002, () => {
  console.log("Backend 2 is listening on 3002 \n");
});

import express from "express";

const app = express();

app.use(express.json());

app.use((req, res) => {
  console.log("received by backend 1 sending response .... \n");

  console.log("request reached Backend 1 \n");
  res.json({
    server: "Backend 1",
    path: req.originalUrl,
    method: req.method,
  });
});

app.listen(3001, () => {
  console.log("Backend 1 is listening on 3001 \n");
});

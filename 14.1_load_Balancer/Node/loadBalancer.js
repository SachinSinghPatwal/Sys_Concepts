import express from "express";
import http from "http";
import { pipeline } from "stream";

const app = express();

let currentIndex = 0;

const backends = [
  { host: "localhost", port: 3001 },
  { host: "localhost", port: 3002 },
  { host: "localhost", port: 3003 },
];

app.use((req, res) => {
  console.log("========================================");
  console.log("Received HTTP request from Client");

  // ----------------------------
  // Round Robin Selection
  // ----------------------------
  const selectedIndex = currentIndex;
  const backend = backends[selectedIndex];

  currentIndex = (currentIndex + 1) % backends.length;

  console.log(
    `Selected Backend ${selectedIndex + 1} (${backend.host}:${backend.port})`,
  );

  // ----------------------------
  // Create outgoing request
  // ----------------------------
  const backendReq = http.request(
    {
      hostname: backend.host,
      port: backend.port,
      method: req.method,
      path: req.originalUrl,
      headers: req.headers,
    },
    (backendRes) => {
      console.log(`Received HTTP response from Backend ${selectedIndex + 1}`);

      // Copy status code & headers
      res.writeHead(backendRes.statusCode ?? 500, backendRes.headers);

      console.log("Streaming response back to Client...");

      pipeline(backendRes, res, (err) => {
        if (err) {
          console.error("Response pipeline failed:", err);
        } else {
          console.log("Response forwarding completed.");
        }
      });
    },
  );

  backendReq.on("error", (err) => {
    console.error(
      `Failed to connect to Backend ${selectedIndex + 1}:`,
      err.message,
    );

    if (!res.headersSent) {
      res.statusCode = 502;
      res.end("Bad Gateway");
    }
  });

  console.log("Streaming request to Backend...");

  pipeline(req, backendReq, (err) => {
    if (err) {
      console.error("Request pipeline failed:", err);
    } else {
      console.log("Request forwarding completed.");
    }
  });
});

app.listen(3000, () => {
  console.log("Load Balancer listening on port 3000");
});

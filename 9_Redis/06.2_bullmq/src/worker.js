import { Worker } from "bullmq";
import { connection } from "./queue.js";

const emailWorker = new Worker(
  "emails",
  async (job) => {
    console.log(`Processing job ${job.id} with data:`, job.data, job.data);
    await new Promise((reject) =>
      setTimeout(() => {
        reject("something went wrong");
      }, 1000),
    );
    console.log(`Completed job ${job.id}`);
  },
  { connection },
);

emailWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully.`);
});

emailWorker.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed with error:`, err);
});

emailWorker.on("progress", (progress) => {
  console.log(`Job progress: ${progress}%`);
});

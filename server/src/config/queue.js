const Queue = require("bull");
const redis = require("./redis");

// Create message queue
const messageQueue = new Queue("messages", {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
  },
});

// Queue events
messageQueue.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

messageQueue.on("failed", (job, err) => {
  console.log(`Job ${job.id} failed with error:`, err.message);
});

module.exports = {
  messageQueue,
};
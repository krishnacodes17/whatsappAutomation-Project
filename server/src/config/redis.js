const redis = require('redis');

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD || undefined,
});

redisClient.on('error', (err) => {
  console.error(' Redis Error:', err.message);
});

redisClient.on('connect', () => {
  console.log(' Redis Connected');
});

// For redis v4+, we need to connect explicitly
(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error(' Redis Connection Error:', err.message);
  }
})();

module.exports = redisClient;
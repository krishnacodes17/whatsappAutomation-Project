const redis = require('redis');

const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
  },
  password: process.env.REDIS_PASSWORD,
});

redisClient.on('error', (err) => {
  console.error('Redis Error:', err.message);
});

redisClient.on('connect', () => {
  console.log('Redis Connected!');
});

(async () => {
  try {
    await redisClient.connect();
    console.log('Redis Connected Successfully!');
  } catch (err) {
    console.error('Redis Connection Error:', err.message);
  }
})();

module.exports = redisClient;
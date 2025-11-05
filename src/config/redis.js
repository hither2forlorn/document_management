const redis = require("redis");
const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = process.env.REDIS_PORT;

const client = redis.createClient({
  host: REDIS_HOST,
  port: REDIS_PORT,
});

client.on("error", function (error) {
  console.error(error);
});

module.exports = client;

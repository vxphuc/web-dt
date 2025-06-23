const {createClient} = require("redis");
require("dotenv").config();
const createRedisClient = async () => {
  const client = createClient({
    url: process.env.REDIS_URL
  });
  return client;
}

module.exports = {
  createRedisClient,
};

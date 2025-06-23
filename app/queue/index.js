const { Queue } = require("bullmq");
const { createRedisClient } = require("../../config/redis");
require("dotenv").config();

const redisConn = createRedisClient();

const createQueue = new Queue("notificationQueue", {connection: redisConn});

module.exports = {
  createQueue,
};

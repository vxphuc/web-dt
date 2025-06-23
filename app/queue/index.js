const { Queue } = require("bullmq");
const { createRedisClient } = require("../../config/redis");
require("dotenv").config();

const redisClient = createRedisClient();

const createQueue = new Queue("notificationQueue", {
  connection: {
    host: "redis-10304.c99.us-east-1-4.ec2.redns.redis-cloud.com",
    port: 10304,
    username: "default",
    password: "baCuPa8MxDKqjEA0YKYFEndn9sVeO2Fj",
    tls: {}, // Quan trọng khi dùng Redis Cloud
  },
});

module.exports = {
  createQueue,
};

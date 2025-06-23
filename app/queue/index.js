const { Queue } = require("bullmq");
const { createRedisClient } = require("../../config/redis");
const { createClient } = require("redis");


const queueInstance = new Queue("notificationQueue", {
  connection: {
    username: "default",
    password: "baCuPa8MxDKqjEA0YKYFEndn9sVeO2Fj",
    host: "redis-10304.c99.us-east-1-4.ec2.redns.redis-cloud.com",
    port: 10304,
  },
});
module.exports = {
  queueInstance,
};

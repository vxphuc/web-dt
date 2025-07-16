const { Worker } = require("bullmq");
const initSocket = require("../socket/index");
const { createRedisClient } = require("../../config/redis");
const Notification = require("../models/Notification");

const REDIS_OPTS = {
  username: "default",
  password: "baCuPa8MxDKqjEA0YKYFEndn9sVeO2Fj",
  socket: {
    host: "redis-10304.c99.us-east-1-4.ec2.redns.redis-cloud.com",
    port: 10304,
    tls: true,
  },
};


const startWorker = async (server) => {
  const io = await initSocket(server);
  const redisConn = await createRedisClient();
  await new Worker(
    "notificationQueue",
    async (job) => {
      console.log("Processing job:", job.id);
      const { orderId, message } = job.data;
      const n = await Notification.create({
        orderId,
        message,
      });
      io.to("admins").emit("notification", n);
    },
    {
      connection: REDIS_OPTS,
    }
  );
};

module.exports = {
  startWorker,
};

const { Worker } = require("bullmq");
const initSocket = require("../socket/index");
const { createRedisClient } = require("../../config/redis");
const Notification = require("../models/Notification");

const startWorker = async (server) => {
  const io = await initSocket(server);
  const worker = new Worker(
    "notificationQueue",
    async (job) => {
      const { orderId, message } = job.data;
      const n = await Notification.create({
        orderId,
        message,
      });
      io.to("admins").emit("notification", n);
    },
    {
      connection: {
        password: "baCuPa8MxDKqjEA0YKYFEndn9sVeO2Fj",
        socket: {
          host: "redis-10304.c99.us-east-1-4.ec2.redns.redis-cloud.com",
          port: 10304,
        },
      },
    }
  );
};

module.exports = {
  startWorker,
};

const { Worker } = require("bullmq");
const initSocket = require("../socket/index");
const { createRedisClient } = require("../../config/redis");
const Notification = require("../models/Notification");

const startWorker = async (server) => {
  const io = await initSocket(server);
  const redisConn = createRedisClient();
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
      connection: redisConn,
    }
  );
};

module.exports = {
  startWorker,
};

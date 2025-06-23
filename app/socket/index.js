const { Server } = require("socket.io");
const { createRedisClient } = require("../../config/redis");
const { createAdapter } = require("@socket.io/redis-adapter");
const {
  registerNotificationHandlers,
} = require("./handlers/notificationHandler");

module.exports = initSocket = async (server) => {
  const io = new Server(server, { cors: { origin: "*" } });
  const pub = await createRedisClient();
  const sub = await createRedisClient();
  io.adapter(createAdapter(pub, sub));
  console.log("Redis connected");
  io.on("connection", (socket) => {
    registerNotificationHandlers(io, socket);
  });

  return io;
};

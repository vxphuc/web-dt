const { createClient } = require("redis");

let client;

const connectRedis = async () => {
  if (!client) {
    client = createClient({
      socket: {
        host: process.env.REDIS_HOST || "redis",
        port: process.env.REDIS_PORT || 6379,
      },
      username: "default", // Có thể bỏ nếu Redis không dùng ACL
    });

    client.on("error", (err) => console.error("❌ Redis error:", err));
    client.on("connect", () => console.log("✅ Redis connected"));

    await client.connect();
  }

  return client;
};

const getRedisClient = () => {
  if (!client) {
    throw new Error("❌ Redis client chưa được kết nối. Hãy gọi connectRedis() trước!");
  }
  return client;
};

module.exports = {
  connectRedis,
  getRedisClient,
};

const {createClient} = require("redis");
const createRedisClient = async () => {
  const client = createClient({
    username: "default",
    password: "baCuPa8MxDKqjEA0YKYFEndn9sVeO2Fj",
    socket: {
      host: "redis-10304.c99.us-east-1-4.ec2.redns.redis-cloud.com",
      port: 10304,
    },
  });
  await client.connect();

  return client;
}

module.exports = {
  createRedisClient,
};

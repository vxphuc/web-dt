const { createClient } = require("redis");
const createRedisClient = async () => {
  const client = createClient({url: 'rediss://default:baCuPa8MxDKqjEA0YKYFEndn9sVeO2Fj@redis-10304.c99.us-east-1-4.ec2.redns.redis-cloud.com:10304'});

  return client;
};

module.exports = {
  createRedisClient,
};

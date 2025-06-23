const { Queue } = require('bullmq');
const { createRedisClient } = require('../../config/redis');

let queueInstance;

async function getQueue() {
  if (!queueInstance) {
    const redisClient = await createRedisClient();
    queueInstance = new Queue('notificationQueue', { connection: redisClient });
  }
  return queueInstance;
}

module.exports = getQueue;

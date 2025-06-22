const {Queue} = require('bullmq');
const {createRedisClient} = require('../../config/redis');

const redisClient = createRedisClient();

const createQueue = new Queue('notificationQueue', { connection: redisClient });

module.exports = {
    createQueue,
}

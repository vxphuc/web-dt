const {Queue} = require('bullmq');
const {createRedisClient} = require('../../config/redis');
require("dotenv").config();

const redisClient = createRedisClient();

const createQueue = new Queue('notificationQueue', { connection: process.env.REDIS_URL });

module.exports = {
    createQueue,
}

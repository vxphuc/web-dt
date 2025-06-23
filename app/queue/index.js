const {Queue} = require('bullmq');
const {createRedisClient} = require('../../config/redis');


const createQueue = async () => {

    const redisClient = await createRedisClient();
    return new Queue('notificationQueue', {
        connection: redisClient,
    });
}

module.exports = {
    createQueue,
}

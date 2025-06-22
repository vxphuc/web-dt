const {Server} = require('socket.io');
const {createRedisClient} = require('../../config/redis')
const {createAdapter} = require('@socket.io/redis-adapter');
const {registerNotificationHandlers} = require('./handlers/notificationHandler');


module.exports = initSocket = async (server) =>{
     const io = new Server(server, { cors: { origin: '*' } });
     pub = await createRedisClient();
     sub = await createRedisClient();
     Promise.all([pub.connect(), sub.connect()])
         .then(() => {
             io.adapter(createAdapter(pub, sub));
             console.log('Redis connected');
         })
         .catch((err) => {
             console.error('Redis connection error:', err);
         });

     io.on('connection', (socket) => {
          registerNotificationHandlers(io, socket);
     });

     return io;

}
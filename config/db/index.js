const mongoose = require('mongoose');
require('dotenv').config()

const connect_mongodb = process.env.CONNECT_MONGODB
function connect() {
    mongoose.connect(connect_mongodb)
        .then(() => console.log('Connected!'));
}
module.exports = { connect };

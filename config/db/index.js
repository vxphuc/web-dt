const mongoose = require('mongoose');
require('dotenv').config()

const connect_mongodb = process.env.CONNECT_MONGODB
function connect() {
    mongoose.connect(connect_mongodb)
        .then(() => console.log('Connected!'));
}
// mongodb+srv://hkmediadtgroup:41iofkP4SrmA49wk@cluster0.3lrfdio.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
// mongodb+srv://hkmediadtgroup:hkmedia@dtshop.ryjmkoe.mongodb.net/?retryWrites=true&w=majority&appName=DTShop

module.exports = { connect };
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const banner = new Schema({
    image: {type: String},
    dateCreate : {type: Date, default: Date.now },
})

module.exports = mongoose.model('Banner', banner)
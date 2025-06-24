const mongoose = require('mongoose');
const { Schema } = mongoose;

const road = new Schema({
    nameRoad: String,
    idWards : {
        type: Number
    },
    userUID : {
        type: String
    },
    isDefault : {
        type: Boolean,
        default: false
    },
})

module.exports = mongoose.model('Road', road);
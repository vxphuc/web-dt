const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bankSchema = new Schema({
    id:{
        type: String,
        required: true,
        unique: true
    },
    transactionDateTime: {
        type: Date,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    orderId: {
        type: String
    }
});

module.exports = mongoose.model('Bank', bankSchema);